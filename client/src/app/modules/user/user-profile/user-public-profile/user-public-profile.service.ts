import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { PictureModel } from '@dto'
import { environment } from '@env'
import { ApiPath } from '@shared-lib/constants'
import { Observable } from 'rxjs'

@Injectable({
    providedIn: 'root'
})
export class UserPublicProfileService {

    constructor(
        private http: HttpClient
    ) {
    }

    pictureAdd(pictureModel: PictureModel): Observable<boolean> {
        return this.http.post<boolean>(environment.apiEndPoint + ApiPath.picture_add, pictureModel)
    }

}