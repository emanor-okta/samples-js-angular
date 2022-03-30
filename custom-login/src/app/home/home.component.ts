/*!
 * Copyright (c) 2018, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

import { Component, Inject, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { OktaAuthStateService, OKTA_AUTH } from '@okta/okta-angular';
import { OktaAuth } from '@okta/okta-auth-js';


interface ResourceServerExample {
  label: string;
  url: string;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  resourceServerExamples: Array<ResourceServerExample>;
  userName: string = '';

  constructor(public authStateService: OktaAuthStateService, @Inject(OKTA_AUTH) private oktaAuth : OktaAuth, private http: HttpClient) {
    this.resourceServerExamples = [
      {
        label: 'Node/Express Resource Server Example',
        url: 'https://github.com/okta/samples-nodejs-express-4/tree/master/resource-server',
      },
      {
        label: 'Java/Spring MVC Resource Server Example',
        url: 'https://github.com/okta/samples-java-spring-mvc/tree/master/resource-server',
      },
    ];
  }

  async ngOnInit() {
    if (!await this.setUserClaims()) {
      this.oktaAuth.session.exists()
      .then(exists => {
        console.log('session exists: ' + exists);
        if (exists) {
          this.oktaAuth.token.getWithoutPrompt()
          .then(async tokenResp => {
            this.oktaAuth.tokenManager.setTokens(tokenResp.tokens);
            await this.setUserClaims();
          })
          .catch(err => {
            console.log('Error token.getWithoutPrompt(): ' + err)
          });
        } else {
          console.log('Session does not exist');
          this.http.get('https://{ORG}.okta.com/api/v1/sessions/me', {withCredentials: true})
          .subscribe(
            (response) => {
              console.log('Session Exists in Other Org: ' + response);
              this.oktaAuth.token.getWithPopup({idp: '{IDP_ID}'})
              .then(async tokenResp => {
                this.oktaAuth.tokenManager.setTokens(tokenResp.tokens);
                await this.setUserClaims();
              })
              .catch(err => {
                console.log('Error token.getWithPopup(): ' + err)
              });
            },
            (error) => {
              console.log('Session Doesn\'t Exists in Other Org: ' + error);
            },
            () => {
              // complete handler
              console.log("GET complete");
            }
          )

        }
      })
      .catch(err => {
        console.log('Error calling session.exists(): ' + err);
      });
    }
  }

  async setUserClaims() {
    const isAuthenticated = await this.oktaAuth.isAuthenticated();
    console.log('isAuthenticated: ' + isAuthenticated);
    if (isAuthenticated) {
      const userClaims = await this.oktaAuth.getUser();
      this.userName = userClaims.name as string;
      return true;
    } else {
      return false;
    }
  }
}
