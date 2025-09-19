import { Injectable, inject } from '@angular/core';
import { Firestore, doc, setDoc, updateDoc, getDoc } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class Query {
  private auth = inject(Auth);

  constructor(private readonly fireSt: Firestore) {}

  // Crear documento con UID como ID
  async create(collectionName: string, data: any) {
    try {
      const docRef = doc(this.fireSt, `${collectionName}/${data.uid}`);
      await setDoc(docRef, data);
      console.log('✅ Documento creado con UID:', data.uid);
      return docRef;
    } catch (error) {
      console.error('❌ Error al crear documento:', error);
      throw error;
    }
  }

  // Actualizar datos de usuario
  async updateUser(data: any) {
    const uid = this.auth.currentUser?.uid || data.uid;
    if (!uid) throw new Error('No hay UID de usuario');
    const userRef = doc(this.fireSt, `users/${uid}`);
    return updateDoc(userRef, data);
  }

  // Obtener datos de usuario
  async getUser(uid: string) {
    const userRef = doc(this.fireSt, `users/${uid}`);
    const snap = await getDoc(userRef);
    const data = snap.exists() ? snap.data() : null;
    console.log('📄 getUser Firestore:', data);
    return data;
  }
}
