import { Pipe, PipeTransform } from '@angular/core'
import { environment } from '@env'
import { ApiParams, ApiPath } from '@shared-lib/constants'

@Pipe({
    name: 'slPictureUrl'
})
export class PictureUrlPipe implements PipeTransform {

    transform(value: string): string {
        return value ? environment.apiEndPoint + ApiPath.pictures_get.replace(ApiParams.id, value) : ''
    }

}
