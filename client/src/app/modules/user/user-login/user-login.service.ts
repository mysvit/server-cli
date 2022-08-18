import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { LoginModel, TokenModel } from '@dto'
import { environment } from '@env'
import { ApiPath } from '@shared-lib/constants'
import { Storage } from '@shared/storage'
import { map, Observable } from 'rxjs'

@Injectable({
    providedIn: 'root'
})
export class UserLoginService {

    constructor(
        private http: HttpClient
    ) {
    }

    login(user: LoginModel): Observable<void> {
        return this.http.post<TokenModel>(environment.apiEndPoint + ApiPath.user_login, user)
            .pipe(
                map((data: TokenModel) => {
                    Storage.user_id = data.user_id
                    Storage.token = `Bearer ${data.token}`
                })
            )
    }

}
