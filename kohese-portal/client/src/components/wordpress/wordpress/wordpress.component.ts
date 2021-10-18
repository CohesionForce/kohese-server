/*
 * Copyright (c) 2021 CohesionForce Inc | www.CohesionForce.com | info@CohesionForce.com
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


// Angular
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { Subscription } from 'rxjs';

// Other External Dependencies
import axios from 'axios';

// Kohese
import { ItemProxy } from '../../../../../common/src/item-proxy';
import { ItemRepository } from '../../../services/item-repository/item-repository.service';
import { DialogService } from '../../../services/dialog/dialog.service';

/**
 * Interface for post title, content and excerpt
 */
 interface ContentObject {
	//This property is always present
	rendered: string
	//This property is only present in some contexts
	raw?: string
}

/**
 * Interface for describing post title
 */
interface PostTitle extends ContentObject {}
/**
 * Interface for describing post content
 */
interface PostContent extends ContentObject {}
/**
 * Interface for describing post excerpt
 */
interface PostExcerpt extends ContentObject {}

/**
 * Interface describing a WordPress post
 */
interface Post {
	title: PostTitle
	content: PostContent
	excerpt: PostExcerpt
	date: string
	id: number
}


@Component({
  selector: 'app-wordpress',
  templateUrl: './wordpress.component.html',
  styleUrls: ['./wordpress.component.scss']
})
export class WordpressComponent implements OnInit {

  constructor (
              private title : Title,
              private router : ActivatedRoute,
              private itemRepository : ItemRepository,
              private dialogService : DialogService
  ) {
    this.title.setTitle('WordPress Editor');
  }

  treeConfigSubscription : Subscription;

  private _itemProxy: ItemProxy;
  get itemProxy() {
    return this._itemProxy;
  }


  _contents: Array<Post> = [];
  get contents() {
    return this._contents;
  }
  set contents(value: any) {
    this._contents.push(value);
  }

  _postedData = {
    data: [],
    isLoaded: false,
  }

  get postedData() {
    return this._postedData;
  }
  set postedData(value: any) {
    this._postedData = value;
  }

  _authToken: string = '';
  get authToken() {
    return this._authToken;
  }
  set authToken(token: any) {
    this._authToken = token;
  }

  ngOnInit(): void {

    this.treeConfigSubscription = this.itemRepository.getTreeConfig().subscribe(
      (treeConfigurationObject: any) => {
      if (treeConfigurationObject) {
        this.router.params.subscribe((params: Params) => {
          if (params['id']) {
            this._itemProxy = treeConfigurationObject.config.getProxyFor(params['id']);
          }
        });
      }
    });

    // Login using JWT
    axios.post(
      'http://localhost:8000/wp-json/jwt-auth/v1/token',
      {
        username: 'admin',
        password: 'password'
      }
    ).then(res => this.renderAuthenticate({
      data: res.data
    })).catch(err => console.log(err));

    // GETs highest-level site-wide data
    axios.get('http://localhost:8000/wp-json/')
      .then(res => this.render({
        data: res.data,
        isLoaded: true
      }))
      .catch(err => console.log(err));

      // axios.get('http://localhost:8000/wp-json/wp/v2/comments')
      // .then(res => this.render({
      //   data: res.data,
      //   isLoaded: true
      // }))
      // .catch(err => console.log(err));

      // axios.get('http://localhost:8000/wp-json/wp/v2/pages')
      // .then(res => this.render({
      //   data: res.data,
      //   isLoaded: true
      // }))
      // .catch(err => console.log(err));

      // GETs all posts
      axios.get('http://localhost:8000/wp/v2/posts')
      .then(res => this.renderPosts({
        data: res.data,
        isLoaded: true
      }))
      .catch(err => console.log(err));
  }

  renderAuthenticate(authData: any) {
    this.postedData = authData;
    if(this.postedData.data.token) {
      this.authToken = this.postedData.data.token;
    }
    console.log(this.postedData);
  }

  render(siteData: any) {
    this.postedData = siteData;
  }

  renderPosts(siteData: any) {
    this.postedData = siteData;

    if(this.postedData.length) {
      for(let i=0; i < this.postedData.length; i++) {
        let postTitle = this.postedData[i].title.rendered;
        let postContent = this.postedData[i].content.rendered;
        let postExcerpt = this.postedData[i].excerpt.rendered;
        let postDate = this.postedData[i].date;
        let postId = this.postedData[i].id;
        // let userToken = this.data[i].token

        let post = {
          title: postTitle,
          content: postContent,
          excerpt: postExcerpt,
          date: postDate,
          id: postId,
          // token: userToken
        }

        this.contents.push(post)
      }
    }
  }

  // render(siteData: any) {
  //   this.data = siteData;

  //   if(this.data.content) {
  //     if(this.data.content.rendered) {
  //     }
  //   }

  //   if(this.data.title) {
  //     if(this.data.title.rendered) {
  //       let displayableInfo = this.data.title.rendered;
  //       this.contents.push(displayableInfo);
  //     }
  //   }

  //   if(this.data.excerpt) {
  //     if(this.data.content.rendered) {
  //       let displayableInfo = this.data.content.rendered;
  //       this.contents.push(displayableInfo);
  //     }
  //   }

  //   this.contents.push(this.data);
  //   console.log(this._data);

  // }

  getUserAccount() {
    return axios.get('/user/admin');
  }

  getUserPermissions() {
    return axios.get('/user/admin/permissions');
  }

  // Promise.all([getUserAccount(), getUserPermissions()])
  //   .then(function (results) {
  //     const account = results[0];
  //     const permission = results[1];
  //   });

}
