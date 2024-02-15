import { Component } from '@angular/core';
import { WebService } from './web.service';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';

@Component({
  selector: 'collections',
  templateUrl: './collections.component.html',
  styleUrls: ['./collections.component.css']
})

// Class to show the items in the user's personal collection
export class CollectionsComponent {

  comic_list: any = [];
  page: number = 1;
  length: any;
  username: any;

  constructor(public webService: WebService, private route: ActivatedRoute, 
    public authService: AuthService) {}

  // On startup the page number is set and the items from the collection are retrieved
  ngOnInit() {
    if (sessionStorage['page']) {
      this.page = Number(sessionStorage['page'])
    }
    this.username = this.route.snapshot.params['username'];
    this.comic_list = this.webService.getCollection(this.username, this.page);
  }

  // Goes back a number of pages when the previous page button is pressed
  previousPage(number: any) {
    if (this.page > number) {
      this.page = this.page - number;
      sessionStorage['page'] = this.page
      this.comic_list = this.webService.getCollection(this.username, this.page);
    }
  }

  // Goes foward a number of pages when the foward page button is pressed
  nextPage(number: any) {
    this.page = this.page + number;
    sessionStorage['page'] = this.page
    this.comic_list = this.webService.getCollection(this.username, this.page);

    // If the current page length is empty then send the user back as they can't go any further
    this.comic_list.subscribe((result: { length: string; })=>this.length = result.length);
    if(this.length == '') {
      this.page = this.page - number;
      sessionStorage['page'] = this.page;
      this.comic_list = this.webService.getCollection(this.username, this.page);
    
      // Check if this is the last page
      this.comic_list.subscribe((result: { length: string; })=>this.isLastPage(result.length, number));
    }
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
    this.comic_list = this.webService.getCollection(this.username, this.page);
  }
}
