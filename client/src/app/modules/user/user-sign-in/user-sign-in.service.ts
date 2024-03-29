import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { StatesService } from '@core/services/states.service'
import { AuthModel, AuthType, EmailModel, ResetPassModel, SignInModel, VerifyCodeModel } from '@dto'
import { environment } from '@env'
import { ApiPath, ClientPath } from '@shared-lib/constants'
import { SlStorage } from '@shared/storage'
import { SnackBarService } from '@standalone/snack-bar/snack-bar.service'
import { SnackBarType } from '@standalone/snack-bar/snack-bar.type'
import { map, Observable } from 'rxjs'

@Injectable({
    providedIn: 'root'
})
export class UserSignInService {

    constructor(
        private http: HttpClient,
        private router: Router,
        private states: StatesService,
        private snackBar: SnackBarService
    ) {
    }

    signIn(model: SignInModel, activatedRoute: ActivatedRoute): Observable<void> {
        return this.http.post<AuthModel>(environment.apiEndPoint + ApiPath.users_sign_in, model)
            .pipe(
                map((data: AuthModel) => {
                    SlStorage.user_id = data.userId
                    SlStorage.email = data.email
                    switch (data.authType) {
                        case AuthType.Authenticated:
                            this.userAuthenticated(data).finally()
                            break
                        case AuthType.NeedVerification:
                            this.router.navigate([ClientPath.verify], {relativeTo: activatedRoute}).finally()
                            break
                    }
                })
            )
    }

    verifyCode(verificationCode: string): Observable<void> {
        return this.http.put<AuthModel>(environment.apiEndPoint + ApiPath.users_verify_code,
            <VerifyCodeModel>{verificationCode: verificationCode})
            .pipe(
                map((data: AuthModel) => {
                    switch (data.authType) {
                        case AuthType.Authenticated:
                            this.userAuthenticated(data).finally(() =>
                                this.snackBar.show('Verification ok. You signed in in to your account.', SnackBarType.Success, 5000)
                            )
                            break
                        case AuthType.VerifiedButNotAuth:
                            this.router.navigate([ClientPath.sign_in]).finally(() =>
                                this.snackBar.show('Verification ok. Sign in to your account.', SnackBarType.Success, 5000)
                            )
                            break
                    }
                })
            )
    }

    resendCode(): Observable<number> {
        return this.http.put<number>(environment.apiEndPoint + ApiPath.users_resend_code, {})
    }

    forgotPass(email: string): Observable<number> {
        return this.http.post<number>(environment.apiEndPoint + ApiPath.users_forgot_pass,
            <EmailModel>{
                email: email
            }
        )
    }

    resetPass(resetPassModel: ResetPassModel): Observable<number> {
        return this.http.post<number>(environment.apiEndPoint + ApiPath.users_reset_pass, resetPassModel)
    }

    private userAuthenticated(data: AuthModel): Promise<boolean> {
        SlStorage.isAuth = true
        SlStorage.token = `Bearer ${data.token}`
        SlStorage.email = data.email
        SlStorage.nickname = data.nickname
        SlStorage.avatar_id = data.avatarId
        return this.router.navigate([this.states.redirectUrl ?? ClientPath.slash])
    }

}
