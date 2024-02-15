import { Component } from '@angular/core';
import { WebService } from './web.service';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '@auth0/auth0-angular';

@Component({
  selector: 'comic',
  templateUrl: './comic.component.html',
  styleUrls: ['./comic.component.css']
})

// Class for showing a single comic
export class ComicComponent {
  comic_list: any = [];
  reviews: any = [];
  profileJSON: string = '';
  username: any;
  id: any;
  isInCollection: any;
  buttonName: any;

  reviewForm: any;
  collectionForm: any;

  collectionID: any;

  page: number = 1;

  hello: any;

  constructor(private webService: WebService,
  private route: ActivatedRoute,
  private formBuilder: FormBuilder,
  public authService: AuthService) {}

  // When the app starts the forms for reviews and collections are set
  // The comic and review details are retrieved
  ngOnInit() {
    let profileJson = '';

    this.reviewForm = this.formBuilder.group( {
      username: ['', Validators.required],
      comment: ['', Validators.required],
      stars:5,
    });

    this.collectionForm = this.formBuilder.group( {
      username: ['', Validators.required],
      _id: ['', Validators.required],
      issue_title: ['', Validators.required],
      publish_date: ['', Validators.required],
      image_url: ['', Validators.required]
    });

    this.comic_list = this.webService.getComic(
    this.route.snapshot.params['id']);

    this.reviews = this.webService.getReviews(
      this.route.snapshot.params['id']);

    this.id = this.route.snapshot.params['id'];
    // Test code to get username
    this.authService.user$.subscribe(
      (profile) => (this.profileJSON = JSON.stringify(profile, null, 2)),
    );
  
    this.getUsername();
    this.isInCollection = false;
  }

  //Gets the username from auth0 and checks if comic is in their collection
  getUsername(){
    this.authService.user$.subscribe(data => this.getId(data));
  }
  // Gets the id of the current comic in the users collection
  // If it gets the id then the comic is in the users collection
  // If there is no id then comic is not in users collection
  getId(data: any){
    this.username = data.name;

    // Code to check if item is in the collection
    // If it is then the delete button shows
    // If not the add to collection button shows
    this.webService.checkCollection(this.username, this.id).subscribe(result=> {
      if(result == '') {
        this.buttonName = "Add to Collection";
        this.isInCollection = false;
      } else {
        this.buttonName = "Remove from Collection";
        this.isInCollection = true;
      }
    });
  }

  // Runs a different function depending on whether the comic is in the users collection or not
  Collection() {
    if (this.isInCollection == false) {
      this.AddCollection();
    } else {
      this.RemoveCollection(this.username);
    }
  }

  // Adds a new item to the users personal collection
  AddCollection() {
    this.webService.postCollection(this.collectionForm.value)
    .subscribe( (response: any) => {
      sessionStorage['page'] = 1;
      return window.location.href='http://localhost:4200/collections/' + this.collectionForm.value["username"];
    } )
  }

  // Remove an item from users personal collection by checking if it 
  // exists to retrieve its id and then deleting the item with that id
  RemoveCollection(username: any) {
    this.webService.checkCollection(username, 
      this.route.snapshot.params['id'])
      .subscribe(result=> {
        this.collectionID = result;
        this.webService.deleteCollection(this.collectionID)
        .subscribe( (response: any) => {
        return window.location.href='http://localhost:4200/collections/' + this.collectionForm.value["username"];
      })
    });
  }

  // Takes the user to the edit comic page
  onEdit() {
    let id = this.route.snapshot.params['id'];
    return window.location.href='http://localhost:4200/comics/' + id + '/edit';
  }

  // Deletes the comic currently being shown
  onDelete() {
    let id = this.route.snapshot.params['id'];
    this.webService.deleteComic(id)
    .subscribe( (response: any) => {
      return window.location.href='http://localhost:4200/comics';
    } )
  }

  // Adds a new review to the comic
  onSubmit() {
    this.webService.postReview(this.reviewForm.value)
    .subscribe( (response: any) => {
      this.reviewForm.reset();
      this.reviews = this.webService.getReviews(this.route.snapshot.params['id']);
    })
  }

  // Validation of the add review form
  isInvalid(control: any) {
    return this.reviewForm.controls[control].invalid && this.reviewForm.controls[control].touched;
  }
  isUnTouched() {
    return this.reviewForm.controls.comment.pristine;
  }
  isIncomplete(){
    return this.isInvalid('username') || this.isInvalid('comment') || this.isUnTouched();
  }
}
