import { Injectable } from '@angular/core';
import * as firebase from 'firebase/app';
import { Observable } from 'rxjs';
import { User } from '../models/user';
import { AngularFireAuth } from 'angularfire2/auth';
import { Router } from '@angular/router';

@Injectable()
export class AuthService {
  userObservable: Observable<firebase.User>;
  userDetails: firebase.User = null;

  constructor(private firebaseAuth: AngularFireAuth, private router: Router) {
    this.userObservable = firebaseAuth.authState;
    this.userObservable.subscribe(u => {
      if (u) {
        this.userDetails = u;
        console.log(this.userDetails.uid);
        localStorage.setItem('userID', this.userDetails.uid);
      } else {
        this.userDetails = null;
      }

    });
  }

  createUserWithEmailAndPassword(emailID: string, password: string) {
    return this.firebaseAuth.auth.createUserWithEmailAndPassword(
      emailID,
      password
    );
  }

  signInRegular(email, password) {
    const credential = firebase.auth.EmailAuthProvider.credential(
      email,
      password
    );
    return this.firebaseAuth.auth.signInWithEmailAndPassword(email, password);
  }

  isLoggedIn() {
    if (this.userDetails == null) {
      return false;
    } else {
      return true;
    }
  }

  logout() {
    this.firebaseAuth.auth.signOut().then(res => this.router.navigate(['/']));
  }

  getLoggedInUser(): User {
    const loggedUser: User = new User();
    const user = this.firebaseAuth.auth.currentUser;

    if (user) {
      this.userDetails = user;
      if (user != null) {
        loggedUser.$key = user.uid;
        loggedUser.userName = user.displayName;
        loggedUser.emailId = user.email;
        loggedUser.phoneNumber = user.phoneNumber;
        loggedUser.avatar = user.photoURL;
        loggedUser.isAdmin = user.email === 'admin@gmail.com' ? true : false;
      }
    } else {
      this.userDetails = null;
    }

    return loggedUser;
  }
}
