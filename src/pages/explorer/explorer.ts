import { Component } from '@angular/core';
import { NavController, LoadingController } from 'ionic-angular';
import * as firebase from 'firebase';

@Component({
  selector: 'page-explorer',
  templateUrl: 'explorer.html'
})
export class ExplorerPage {
    private storage  : any;
    private database : any;
    private result   : any;
  
// Le constructeur initialise et se connecte à Firebase avec les données d'authentification
// dans environment.ts
// Dans cette classe, 2 services de Firebase sont utilisés : database et storage
// Ensuite, les photos contenues dans Firebase storage seront affichés
  constructor(public navCtrl: NavController, public loadingCtrl: LoadingController) {
    this.result   = [];
    this.storage  = firebase.storage();
    this.database = firebase.database();
    this.database.ref('images/').once('value', snapshot => {
        snapshot.forEach(childSnapshop => {
            this.getImage(childSnapshop.val().path);
        })
    });
    console.log('result = ',this.result);
  }
  returnHome(){
    this.navCtrl.pop();
  }

// Méthode pour récupérer une image à l'aide d'un path
  getImage(path){
    this.storage.ref(path).getDownloadURL().then( url => {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        xhr.send();
        this.result.push(url);
    }).catch(error => {
        console.log('error pathRef = ', error);
    })
  }
}