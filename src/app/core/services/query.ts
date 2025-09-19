import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, doc, updateDoc } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { inject } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class Query {
  private auth = inject(Auth);

  constructor(private readonly fireSt: Firestore) {}

  async create(collectionName: string, data: any) {
    try {
      const reference = collection(this.fireSt, collectionName);
      const res = await addDoc(reference, data);
      console.log(res.id);
      return res;
    } catch (error) {
      throw error;
    }
  }

  async updateUser(data: any) {
    const uid = this.auth.currentUser?.uid || data.uid;
    if (!uid) throw new Error('No hay UID de usuario');
    const userRef = doc(this.fireSt, `users/${uid}`);
    return updateDoc(userRef, data);
  }
}