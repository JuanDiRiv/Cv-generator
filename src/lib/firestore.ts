// src/lib/firestore.ts
import {
  collection, doc, addDoc, updateDoc, deleteDoc,
  getDocs, getDoc, query, orderBy,
} from 'firebase/firestore'
import { db } from './firebase'
import type { CVDocument } from '@/types/cv'

const cvsCol = (uid: string) => collection(db, 'users', uid, 'cvs')

export async function createCV(uid: string, data: Omit<CVDocument, 'id'>): Promise<string> {
  const ref = await addDoc(cvsCol(uid), { ...data, updatedAt: Date.now() })
  return ref.id
}

export async function getUserCVs(uid: string): Promise<CVDocument[]> {
  const q = query(cvsCol(uid), orderBy('updatedAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as CVDocument))
}

export async function getCV(uid: string, cvId: string): Promise<CVDocument | null> {
  const snap = await getDoc(doc(cvsCol(uid), cvId))
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() } as CVDocument
}

export async function updateCV(uid: string, cvId: string, data: Partial<CVDocument>): Promise<void> {
  await updateDoc(doc(cvsCol(uid), cvId), { ...data, updatedAt: Date.now() })
}

export async function deleteCV(uid: string, cvId: string): Promise<void> {
  await deleteDoc(doc(cvsCol(uid), cvId))
}
