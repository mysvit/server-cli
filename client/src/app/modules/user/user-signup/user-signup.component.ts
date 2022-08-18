import { Component } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { SignupModel } from '@dto'
import { ClientPath } from '@shared-lib/constants'
import { ProcessForm } from '@shared/form'
import { FieldValidators } from '@shared/validators'
import { UserSignupModel } from './user-signup.model'
import { UserSignupService } from './user-signup.service'

@Component({
    selector: 'app-user-signup',
    templateUrl: './user-signup.component.html',
    styleUrls: ['./user-signup.component.scss']
})
export class UserSignupComponent extends ProcessForm {

    FieldValidators = FieldValidators
    model = new UserSignupModel()

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private userSignup: UserSignupService
    ) {
        super()
    }

    registerClick() {
        this.model.formGroup.markAllAsTouched()
        if (this.model.formGroup.touched && this.model.formGroup.valid) {
            this.execute(
                this.userSignup.signup(
                    <SignupModel>{
                        email: this.model.email.value,
                        username: this.model.username.value,
                        password: this.model.password.value
                    })
            )
        }
    }

    override processCompleted() {
        super.processCompleted()
        this.router.navigate([ClientPath.forgot_password], {relativeTo: this.route, state: {message: 'Check your email to confirm your account.'}}).finally()
    }

}
