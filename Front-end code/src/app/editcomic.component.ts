import { Component } from '@angular/core';
import { WebService } from './web.service';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'editcomic',
  templateUrl: './editcomic.component.html',
  styleUrls: ['./editcomic.component.css']
})

// Class to edit the details of a specific comic
export class EditComicComponent {
  comic_list: any = [];
  comicForm: any;

  constructor(private webService: WebService,
  private route: ActivatedRoute,
  private formBuilder: FormBuilder) {}

  // On startup it gets the comic details and sets up the edit comic form
  ngOnInit() {
  this.comic_list = this.webService.getComic(
    this.route.snapshot.params['id']);

  this.comicForm = this.formBuilder.group( {
    issue_title: ['', Validators.required],
    issue_description: ['', Validators.required],
    publish_date: ['', Validators.required],
    writer: ['', Validators.required],
    penciler: ['', Validators.required],
    cover_artist: ['', Validators.required],
    image_url: ['', Validators.required]
  });

  }

  // Changes the details of the chosen comic using form data
  onSubmit() {
    let id = this.route.snapshot.params['id'];
    this.webService.editComic(this.comicForm.value, id)
    .subscribe( (response: any) => {
      return window.location.href='http://localhost:4200/comics/' + id;
    })
  }

  // Validation of the edit comic form
  isInvalid(control: any) {
    return this.comicForm.controls[control].invalid;
  }
  isIncomplete(){
    return this.isInvalid('issue_title') || this.isInvalid('publish_date');
  }
}
