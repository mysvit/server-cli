import { Injectable } from '@angular/core'
import { ActivatedRouteSnapshot, CanActivate, CanActivateChild, CanLoad, Route, Router, RouterStateSnapshot } from '@angular/router'
import { StatesService } from '@core/services/states.service'
import { ClientPath } from '@shared-lib/constants'
import { SlStorage } from '@shared/storage'

@Injectable({
    providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanActivateChild, CanLoad {

    constructor(private states: StatesService, private router: Router) {
    }

    canLoad(route: Route): boolean {
        const url = `/${route.path}`
        return this.checkAuth(url)
    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        const url: string = state.url
        return this.checkAuth(url)
    }

    canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        return this.canActivate(route, state)
    }

    checkAuth(url: string): boolean {
        if (!SlStorage.isAuth) {
            // Store the attempted URL for redirecting
            this.states.redirectUrl = url
            // Navigate to the sign-in page
            this.router.navigate([ClientPath.sign_in]).finally()
        }
        return SlStorage.isAuth
    }

}
