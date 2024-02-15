import { HttpClient } from '@angular/common/http';
import { Injectable} from '@angular/core';

@Injectable()
// Class for calling the api for the app
export class WebService {

  private comicID: any;

  constructor(private http: HttpClient) {

  }

  comic_list: any;

  getComics(page: number) {
    return this.http.get(
      'http://localhost:5000/api/v1.0/comics?pn=' + page
    );
  }

  getComic(id: any) {
    this.comicID = id;
    return this.http.get('http://localhost:5000/api/v1.0/comics/' + id);
  }

  searchComics(title:any, page: number) {
    return this.http.get(
      'http://localhost:5000//api/v1.0/comics/search/' + title  + '?pn=' + page
    );
  }

  postComic(comic: any) {
    let postData = new FormData();
    postData.append("issue_title", comic.issue_title);
    postData.append("issue_description", comic.issue_description);
    postData.append("publish_date", comic.publish_date);
    postData.append("writer", comic.writer);
    postData.append("penciler", comic.penciler);
    postData.append("cover_artist", comic.cover_artist);
    postData.append("image_url", comic.image_url);

    return this.http.post('http://localhost:5000/api/v1.0/comics', postData);
  }

  editComic(comic: any, id: any) {
    let postData = new FormData();
    postData.append("issue_title", comic.issue_title);
    postData.append("issue_description", comic.issue_description);
    postData.append("publish_date", comic.publish_date);
    postData.append("writer", comic.writer);
    postData.append("penciler", comic.penciler);
    postData.append("cover_artist", comic.cover_artist);
    postData.append("image_url", comic.image_url);

    return this.http.put('http://localhost:5000/api/v1.0/comics/' + id, postData);
  }

  deleteComic(id: any) {
    return this.http.delete('http://localhost:5000/api/v1.0/comics/' + id);
  }

  getReviews(id: any) {
    return this.http.get(
    'http://localhost:5000/api/v1.0/comics/' +
    id + '/reviews');
  }

  getReview(id: any, review_id: any) {
    console.log('http://localhost:5000/api/v1.0/comics/' +
    id + '/reviews/' + review_id);
    return this.http.get('http://localhost:5000/api/v1.0/comics/' +
    id + '/reviews/' + review_id);
  }

  postReview(review: any) {
    let postData = new FormData();
    postData.append("username", review.username);
    postData.append("comment", review.comment);
    postData.append("stars", review.stars);

    return this.http.post('http://127.0.0.1:5000/api/v1.0/comics/' +
                            this.comicID + '/reviews', postData);
  }

  editReview(review: any, id: any, review_id: any) {
    let postData = new FormData();
    postData.append("username", review.username);
    postData.append("comment", review.comment);
    postData.append("stars", review.stars);


    return this.http.put('http://localhost:5000/api/v1.0/comics/' + 
    id + '/reviews/' + review_id, postData);
  }

  deleteReview(id: any, review_id: any) {
    return this.http.delete('http://localhost:5000/api/v1.0/comics/' + 
    id + '/reviews/' + review_id);
  }

  getCollection(username: any, page: number) {
    return this.http.get('http://localhost:5000/api/v1.0/collections/' + username + '?pn=' + page);
  }

  checkCollection(username: any, issue_id: any) {
    return this.http.get('http://localhost:5000/api/v1.0/collections/' + username + '/' + issue_id);
  }
  
  postCollection(comic: any) {
    console.log(comic.issue_title);
    console.log(comic._id);
    console.log(comic.username);
    let postData = new FormData();
    postData.append("username", comic.username);
    postData.append("issue_id", comic._id);
    postData.append("issue_title", comic.issue_title);
    postData.append("publish_date", comic.publish_date);
    postData.append("image_url", comic.image_url);

    console.log(postData);

    return this.http.post('http://localhost:5000/api/v1.0/collections', postData);
  }

  deleteCollection(id: any) {
    console.log(id);
    console.log('http://localhost:5000/api/v1.0/collections/' + id);
    return this.http.delete('http://localhost:5000/api/v1.0/collections/' + id);
  }

}
