import { Component } from '@angular/core';
import { WebService } from './web.service';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';

@Component({
  selector: 'review',
  templateUrl: './review.component.html',
  styleUrls: ['./review.component.css']
})

// Class for showing a single review
export class ReviewComponent {
  id: any = '';
  review_id: any = '';
  username: any = '';
  comment: any = '';
  stars: any = '';

  constructor(private webService: WebService,
  private route: ActivatedRoute,  public authService: AuthService) {}

  // On startup it gets the id and review details
  ngOnInit() {
    this.id = this.route.snapshot.params['id'];
    this.review_id = this.route.snapshot.params['review_id'];

    this.webService.getReview(this.id, this.review_id)
      .subscribe( (response: any) => {
        this.username = response.username;
        this.comment = response.comment;
        this.stars = response.stars;
    } )
  }

  // Takes the user to the edit review page
  onEdit() {
    return window.location.href='http://localhost:4200/comics/' + this.id + '/reviews/' + this.review_id + '/edit';
  }

  // Deletes the current review
  onDelete() {
    let id = this.route.snapshot.params['id'];
    let review_id = this.route.snapshot.params['review_id'];
    this.webService.deleteReview(id, review_id)
    .subscribe( (response: any) => {
      return window.location.href='http://localhost:4200/comics/' + this.id;
    } )
  }
}
