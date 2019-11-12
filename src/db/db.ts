import * as firebase from 'firebase';

var firebaseConfig = {
    apiKey: "AIzaSyDTMXflI9xCoM2aFgFu4_QBIfd_84ZHb3A",
    authDomain: "timas-jackus.firebaseapp.com",
    databaseURL: "https://timas-jackus.firebaseio.com",
    projectId: "timas-jackus",
    storageBucket: "timas-jackus.appspot.com",
    messagingSenderId: "986525858380",
    appId: "1:986525858380:web:710cbf8a54ac2f86dc52e9",
    measurementId: "G-ZHZ0SMZ5QG"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

export const db = firebase.database();