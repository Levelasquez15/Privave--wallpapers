import { Injectable, inject } from '@angular/core';
import { Firestore, doc, setDoc, updateDoc, getDoc, deleteDoc } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class Query {
  private auth = inject(Auth);

  constructor(private readonly fireSt: Firestore) {}

  async create(collectionName: string, data: any) {
    try {
      const docRef = doc(this.fireSt, `${collectionName}/${data.uid}`);
      await setDoc(docRef, data, { merge: true }); 
      console.log('✅ Documento creado con UID:', data.uid);
      return docRef;
    } catch (error) {
      console.error('❌ Error al crear documento:', error);
      throw error;
    }
  }

 
  async updateUser(data: any) {
    const uid = this.auth.currentUser?.uid || data.uid;
    if (!uid) throw new Error('No hay UID de usuario');
    const userRef = doc(this.fireSt, `users/${uid}`);
    return setDoc(userRef, data, { merge: true }); 
  }

 
  async getUser(uid: string) {
    const userRef = doc(this.fireSt, `users/${uid}`);
    const snap = await getDoc(userRef);
    const data = snap.exists() ? snap.data() : null;
    console.log('getUser Firestore:', data);
    return data;
  }

  async deleteUser(uid: string) {
    try {
      const userRef = doc(this.fireSt, `users/${uid}`);
      await deleteDoc(userRef);
      console.log(`Usuario con UID ${uid} eliminado de Firestore`);
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      throw error;
    }
  }
}

