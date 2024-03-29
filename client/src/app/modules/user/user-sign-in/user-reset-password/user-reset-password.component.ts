import { Component, Injector } from '@angular/core'
import { ResetPassModel } from '@dto'
import { ClientPath } from '@shared-lib/constants'
import { ProcessForm } from '@shared/form'
import { SlStorage } from '@shared/storage'
import { FieldValidators } from '@shared/validators'
import { map } from 'rxjs'
import { UserSignInService } from '../user-sign-in.service'
import { UserResetPasswordFormModel } from './user-reset-password-form-model'

@Component({
    selector: 'app-user-reset-password',
    templateUrl: './user-reset-password.component.html',
    styleUrls: ['./user-reset-password.component.scss']
})
export class UserResetPasswordComponent extends ProcessForm {

    FieldValidators = FieldValidators
    formModel = new UserResetPasswordFormModel()
    email = SlStorage.email

    constructor(
        injector: Injector,
        private userSignIn: UserSignInService
    ) {
        super(injector)
    }

    forgotClick() {
        this.execute(
            this.userSignIn.forgotPass(this.email),
            {completedMessage: 'Check your email to get reset password code.'}
        )
    }

    resetPasswordClick() {
        if (this.formModel.isFieldValid()) {
            this.execute(
                this.userSignIn.resetPass(<ResetPassModel>{
                    email: this.email,
                    resetPassCode: this.formModel.resetCode.value,
                    password: this.formModel.password.value
                })
                    .pipe(
                        map(() => this.router.navigate([ClientPath.slash + ClientPath.sign_in]).finally())
                    ),
                {completedMessage: 'New password set up. Try to log in.'}
            )
        }
    }

}
