import { Component } from '@angular/core';
import { WebService } from './web.service';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';

@Component({
  selector: 'comics',
  templateUrl: './comics.component.html',
  styleUrls: ['./comics.component.css']
})

// Class for showing all comics
export class ComicsComponent {

  comic_list: any = [];
  page: number = 1;
  length: any;

  constructor(public webService: WebService, private route: ActivatedRoute, public authService: AuthService) {}

  // When the app starts the page number is set and all comics are gathered
  ngOnInit() {
    if (sessionStorage['page']) {
      this.page = Number(sessionStorage['page'])
    }
    this.comic_list = this.webService.getComics(this.page);
  }

  // Goes back a number of pages when the previous page button is pressed
  previousPage(number: any) {
    if (this.page > number) {
      this.page = this.page - number;
      sessionStorage['page'] = this.page
      this.comic_list = this.webService.getComics(this.page);
    }
  }

  // Goes foward a number of pages when the foward page button is pressed
  nextPage(number: any) {
    this.page = this.page + number;
    sessionStorage['page'] = this.page
    this.comic_list = this.webService.getComics(this.page);

    // Check if this is the last page
    this.comic_list.subscribe((result: { length: string; })=>this.isLastPage(result.length, number));
  }

  // Check if the current page is empty, 
  // if it is then send the user back as they can't go any further
  isLastPage(result: string, number: number) {
    this.length = result;
    if(this.length == '') {
      this.page = this.page - number;
      sessionStorage['page'] = this.page;
      this.comic_list = this.webService.getComics(this.page);
    }
  }

  // Goes to a specific page when the page button is pressed
  thisPage(number: any) {
    this.page = number;
    sessionStorage['page'] = this.page
    this.comic_list = this.webService.getComics(this.page);
  }
}
