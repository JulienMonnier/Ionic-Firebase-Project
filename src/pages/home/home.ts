import { Component } from '@angular/core';
import { ExplorerPage } from '../explorer/explorer';
import { NavController, LoadingController, AlertController } from 'ionic-angular';
import * as firebase from 'firebase';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { environment } from '../../environments/environment';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  private database      : any;
  private storage       : any;
  private selectedPhoto : any;
  private loading       : any;
  private pictureName   : any;
  private currentImage  : any;

// Le constructeur initialise et se connecte à Firebase avec les données d'authentification
// dans environment.ts
// Dans cette classe, 2 services de Firebase sont utilisés : database et storage
  constructor(public navCtrl: NavController, public camera: Camera, public loadingCtrl: LoadingController, public alertCtrl: AlertController) {
    firebase.initializeApp(environment.firebase);
    this.database = firebase.database();
    this.storage  = firebase.storage();
  }
    
  goFolderExpl() {
    this.navCtrl.push(ExplorerPage);
  }
   
// Ouvre une boite de dialogue pour entrer le nom de la photo
// Puis utilise la méthode grabPicture()
  showAlert() {
    let alert = this.alertCtrl.create({
      title: 'Name your picture',
      inputs: [
        {
          placeholder: 'Title'
        },
      ],
      buttons: [
        {
          text: 'OK',
          handler: data => {
            this.pictureName = alert.data.inputs[0].value
            this.grabPicture()
          }      
        }
      ]
    });
    alert.present();
  }

// Methode pour prendre une photo
  grabPicture() {
    const options: CameraOptions = {
      quality: 100,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE
    }
    
    this.camera.getPicture(options).then((imageData) => {
      this.loading = this.loadingCtrl.create({
        content: 'Please wait...'
      });   
      this.loading.present();
      this.selectedPhoto  = this.dataURItoBlob('data:image/jpeg;base64,' + imageData);
      this.upload();
    }, (err) => {
      console.log('error', err);
    });
  }
   

  dataURItoBlob(dataURI) {
    let binary = atob(dataURI.split(',')[1]);
    let array  = [];
    for (let i = 0; i < binary.length; i++) {
      array.push(binary.charCodeAt(i));
    }
    return new Blob([new Uint8Array(array)], {type: 'image/jpeg'});
  }
 
// Stock la photo prise dans le storage, une promise permet de suivre le succès/échec
  upload() {
    if (this.selectedPhoto) {
      var uploadTask = this.storage.ref().child('images/'+this.pictureName+'.png').put(this.selectedPhoto);
      uploadTask.then(this.onSuccess, this.onError);
      this.setDatabase(this.pictureName);
    }
  }

// Méthode pour inserer les infos de la photo prise dans la database
// Le nom, un id et un chemin
  setDatabase(pictureName){
      let date = new Date();
      this.database.ref('images/' + pictureName).set({
        id: date.getTime(),
        path: 'images/' + pictureName + '.png'
      });
  }

// Si stockage réussi => on affiche la photo puis on insert les infos de la photo à la database 
  onSuccess = (snapshot) => {
    this.currentImage = snapshot.downloadURL;
    this.setDatabase(this.pictureName);
    this.loading.dismiss();
  }

// Si stockage échoue => rien ne se passe, l'erreur sera géré par l'application
  onError = (error) => {
    console.log('error', error);
    this.loading.dismiss();
  }
}