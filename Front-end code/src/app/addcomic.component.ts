import { Component } from '@angular/core';
import { WebService } from './web.service';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'addcomic',
  templateUrl: './addcomic.component.html',
  styleUrls: ['./addcomic.component.css']
})

// Class to add a comic to the comics collection
export class AddComicComponent {
  comic_list: any = [];
  comicForm: any;

  constructor(private webService: WebService,
  private route: ActivatedRoute,
  private formBuilder: FormBuilder) {}

  // On startup the add comic form is set
  ngOnInit() {
  this.comicForm = this.formBuilder.group( {
    issue_title: ['', Validators.required],
    issue_description: ['', Validators.required],
    publish_date: ['', Validators.required],
    writer: ['', Validators.required],
    penciler: ['', Validators.required],
    cover_artist: ['', Validators.required],
    image_url: ['', Validators.required]
  });

  this.comic_list = this.webService.getComic(
  this.route.snapshot.params['id']);

  }

  // Adds the comic to the database
  onSubmit() {
    this.webService.postComic(this.comicForm.value)
    .subscribe( (response: any) => {
      this.comicForm.reset();
    })
  }

  // Validation for the add comic form
  isInvalid(control: any) {
    return this.comicForm.controls[control].invalid && this.comicForm.controls[control].touched;
  }
  isUnTouched() {
    return this.comicForm.controls.issue_title.pristine || this.comicForm.controls.publish_date.pristine;
  }
  isIncomplete(){
    return this.isInvalid('issue_title') || this.isInvalid('publish_date') || this.isUnTouched();
  }
}
