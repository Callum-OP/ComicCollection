import { Component } from '@angular/core';
import { WebService } from './web.service';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'editreview',
  templateUrl: './editreview.component.html',
  styleUrls: ['./editreview.component.css']
})

// Class to edit the details of a specific review
export class EditReviewComponent {
  reviewForm: any;
  id: any;
  review_id: any;
  review_username: any = '';
  review_comment: any = '';
  review_stars: any = '';

  constructor(private webService: WebService,
  private route: ActivatedRoute,
  private formBuilder: FormBuilder) {}

  // On startup it gets the id and review details and sets up the edit review form
  ngOnInit() {
    this.id = this.route.snapshot.params['id'];
    this.review_id = this.route.snapshot.params['review_id'];

    this.webService.getReview(this.id, this.review_id)
      .subscribe( (response: any) => {
        this.review_username = response.username;
        this.review_comment = response.comment;
        this.review_stars = response.stars;
    } )

    this.reviewForm = this.formBuilder.group( {
    username: ['', Validators.required],
    comment: ['', Validators.required],
    stars: 5,
  });

  }

  // Changes the details of the chosen review using form data
  onSubmit() {
    this.webService.editReview(this.reviewForm.value, this.id, this.review_id)
    .subscribe( (response: any) => {
      return window.location.href='http://localhost:4200/comics/' + this.id + '/reviews/' + this.review_id;
    })
  }

  // Validation for the edit review form
  isInvalid(control: any) {
    return this.reviewForm.controls[control].invalid;
  }
  isIncomplete(){
    return this.isInvalid('username') || this.isInvalid('comment');
  }
}
