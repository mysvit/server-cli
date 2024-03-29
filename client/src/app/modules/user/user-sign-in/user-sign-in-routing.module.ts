import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { UserIdGuard } from '@core/services/user-id.guard'
import { ClientPath } from '@shared-lib/constants'
import { UserForgotPasswordComponent } from './user-forgot-password/user-forgot-password.component'
import { UserResetPasswordComponent } from './user-reset-password/user-reset-password.component'
import { UserSignInComponent } from './user-sign-in.component'
import { UserVerificationComponent } from './user-verification/user-verification.component'

const routes: Routes = [
    {
        path: '',
        component: UserSignInComponent
    },
    {
        path: ClientPath.verify,
        canActivate: [UserIdGuard],
        component: UserVerificationComponent
    },
    {
        path: ClientPath.forgot_password,
        component: UserForgotPasswordComponent
    },
    {
        path: ClientPath.reset_password,
        component: UserResetPasswordComponent
    }
]

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class UserSignInRoutingModule {
}
