import Vue from 'vue'
import Vuex from 'vuex'
import router from '../router/index'

import firebase from 'firebase/app'
import credentials from '../firebase/credentials'
import 'firebase/auth'
import 'firebase/firestore'
firebase.initializeApp(credentials.firebaseConfig)
const auth = firebase.auth()
const db = firebase.firestore()

var $ = require('jquery')

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    userInfo: {
      displayName: null,
      email: null,
      emailVerified: null,
      photoURL: null,
      uid: null,
    },
    signedIn: false,
    formError: '',
    formSuccess: ''
  },
  mutations: {
    updateUser(state, payload) {
      state.userInfo.displayName = payload.user.displayName
      state.userInfo.email = payload.user.email
      state.userInfo.emailVerified = payload.user.emailVerified
      state.userInfo.photoURL = payload.user.photoURL
      state.userInfo.uid = payload.user.uid,
      state.signedIn = true
      router.push('dashboard/learn')
    },
    addError(state, msg) {
      state.formError = msg
    },
    addSuccess(state, msg) {
      state.formSuccess = msg
    },
    clearUserData(state) {
      state.userInfo.displayName = null
      state.userInfo.email = null
      state.userInfo.emailVerified = null
      state.userInfo.photoURL = null
      state.userInfo.uid = null
      state.signedIn = false
      router.push('/')
    },
    toggleSidebarState(state) {
      state.sidebarExpanded = !state.sidebarExpanded
    }
  },
  actions: {
    signInWithGoogleAction({ commit }) {
      var provider = new firebase.auth.GoogleAuthProvider()
      auth.signInWithPopup(provider)
        .then(response => commit('updateUser', response))
        .catch(error => commit('addError', error.message))
    },
    signUpWithEmailAction({ commit }, credentials) {
      auth.createUserWithEmailAndPassword(credentials.email, credentials.password)
        .then(response => commit('updateUser', response))
        .catch(error => commit('addError', error.message))
    },
    signInWithEmailAction({ commit }, credentials) {
      auth.signInWithEmailAndPassword(credentials.email, credentials.password)
        .then(response => commit('updateUser', response))
        .catch(error => commit('addError', error.message))
    },
    signOutAction({ commit }) {
      auth.signOut()
        .then(commit('clearUserData'))
        .catch(error => console.log(error))
    },
    resetPassword({ state }) {
      auth.sendPasswordResetEmail(state.userInfo.email)
        .catch(error => console.log(error))
    },
    deleteAccount() {
      auth.currentUser.delete()
        .catch(error => console.log(error))
    },
    createDeck({ state }, payload) {
      var docRef = db.collection('decks').doc('user-decks').collection(state.userInfo.uid).doc(payload.name)
      docRef.get()
      .then(doc => {
        if (!doc.exists) {
          docRef.set(payload.deckData, { merge: true })
            .then(this.commit('addError', ''))
            .then(router.push('dashboard/decks'))
            .catch(error => console.log(error))          
        } else {
          this.commit('addError', 'A deck with this name already exists')
        }
      })
    },
    showSuccess() {
      // Make this fade
      new Promise((resolve) => {
        this.commit('addSuccess', 'Deck created successfully')
        setTimeout(() => {
          $('#successField').fadeOut(1000)
          resolve()
        }, 3500)
      })
        .then(this.commit('addSuccess', ''))
        .catch(error => console.log(error))
    },
    // readDecks({ state }) {
    //   let userDecks = db.collection('decks').doc('user-decks').collection(state.userInfo.uid)
    //   console.log(userDecks)
    //   // for (decks in userDecks) {
    //   //   console.log(decks)
    //   //   // userDecks.doc('deck' + x)
    //   // }
    // }
  },
  modules: {
  },
  getters: {
  }
})
