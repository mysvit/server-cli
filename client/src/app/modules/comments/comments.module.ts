import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MatBadgeModule } from '@angular/material/badge'
import { MatButtonModule } from '@angular/material/button'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatIconModule } from '@angular/material/icon'
import { MatInputModule } from '@angular/material/input'
import { MatMenuModule } from '@angular/material/menu'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { SharedModule } from '@shared/shared.module'
import { DialogCancelDirective, DialogOkDirective } from '@standalone/dialog/dialog-buttons.directive'
import { SearchBarComponent } from '@standalone/search-bar/search-bar.component'
import { SpinnerDirective } from '@standalone/spinner/spinner.directive'
import { CommentDelComponent } from './comment-del/comment-del.component'
import { CommentFormComponent } from './comment-form/comment-form.component'
import { CommentItemComponent } from './comment-item/comment-item.component'
import { CommentViewComponent } from './comment-view/comment-view.component'
import { CommentsRootComponent } from './comments-root/comments-root.component'
import { CommentsRoutingModule } from './comments-routing.module'
import { CommentsComponent } from './comments/comments.component'

@NgModule({
    declarations: [
        CommentDelComponent,
        CommentsComponent,
        CommentFormComponent,
        CommentItemComponent,
        CommentsRootComponent,
        CommentViewComponent,
        CommentDelComponent
    ],
    imports: [
        CommentsRoutingModule,
        SharedModule,
        CommonModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        FormsModule,
        MatMenuModule,
        MatProgressSpinnerModule,
        MatBadgeModule,
        SpinnerDirective,
        SearchBarComponent,
        DialogCancelDirective,
        DialogOkDirective
    ],
    providers: []
})
export class CommentsModule {
}
