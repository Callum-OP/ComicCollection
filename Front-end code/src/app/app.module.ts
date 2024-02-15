import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { ComicsComponent } from './comics.component';
import { WebService } from './web.service';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { HomeComponent } from './home.component';
import { ComicComponent } from './comic.component';
import { ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AddComicComponent } from './addcomic.component';
import { EditComicComponent } from './editcomic.component';
import { ReviewComponent } from './review.component';
import { AuthModule } from '@auth0/auth0-angular';
import { NavComponent } from './nav.component';
import { SearchComponent } from './search.component';
import { EditReviewComponent } from './editreview.component';
import { CollectionsComponent } from './collections.component';

var routes: any = [
  {
   path: '',
   component: HomeComponent
  },
  {
   path: 'comics',
   component: ComicsComponent
  },
  {
    path: 'comics/:id',
    component: ComicComponent
  },
  {
    path: 'newcomic',
    component: AddComicComponent
  },
  {
    path: 'comics/:id/edit',
    component: EditComicComponent
  },
  {
    path: 'comics/:id/reviews/:review_id',
    component: ReviewComponent
  },
  {
    path: 'comics/:id/reviews/:review_id/edit',
    component: EditReviewComponent
  },
  {
    path: 'search/:title',
    component: SearchComponent
  },
  {
    path: 'collections/:username',
    component: CollectionsComponent
  }
 ];

@NgModule({
  declarations: [
    AppComponent, ComicsComponent, HomeComponent, ComicComponent, AddComicComponent, 
    EditComicComponent, ReviewComponent, NavComponent, SearchComponent, EditReviewComponent, CollectionsComponent
  ],
  imports: [
    BrowserModule, HttpClientModule,
    RouterModule.forRoot(routes), ReactiveFormsModule, NgbModule,
    AuthModule.forRoot({
      domain:'dev-r6lrvnosktbzdiit.us.auth0.com',
      clientId: 'y6fhYpJFPCmjFDSl42dcBW2medKvlUU4',
      authorizationParams: {
        redirect_uri: window.location.origin
      }
    })
  ],
  providers: [WebService],
  bootstrap: [AppComponent]
})
export class AppModule { }
