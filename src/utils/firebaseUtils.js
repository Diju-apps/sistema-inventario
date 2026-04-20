import { db } from "../firebase";
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  setDoc,
  query,
  where
} from "firebase/firestore";

// Generic CRUD operations
export const getAll = async (collectionName) => {
  const colRef = collection(db, collectionName);
  const snapshot = await getDocs(colRef);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const add = async (collectionName, data) => {
  const colRef = collection(db, collectionName);
  const docRef = await addDoc(colRef, data);
  return { id: docRef.id, ...data };
};

export const update = async (collectionName, id, data) => {
  const docRef = doc(db, collectionName, id);
  await updateDoc(docRef, data);
  return { id, ...data };
};

export const remove = async (collectionName, id) => {
  const docRef = doc(db, collectionName, id);
  await deleteDoc(docRef);
  return id;
};

// migration helper
export const migrateFromLocalStorage = async () => {
    const keys = ['inventory', 'users', 'assignments', 'maintenance'];
    const results = {};
    
    for (const key of keys) {
        const localData = JSON.parse(localStorage.getItem(key) || '[]');
        if (localData.length > 0) {
            console.log(`Migrating ${key}...`);
            const colRef = collection(db, key);
            
            // Check if already migrated (optional, but safer)
            const snapshot = await getDocs(colRef);
            if (snapshot.empty) {
                for (const item of localData) {
                    // Use the same ID if it exists, otherwise let Firebase generate one
                    if (item.id) {
                        const docId = String(item.id);
                        await setDoc(doc(db, key, docId), item);
                    } else {
                        await addDoc(colRef, item);
                    }
                }
                results[key] = `${localData.length} records migrated`;
            } else {
                results[key] = 'Already migrated (collection not empty)';
            }
        } else {
            results[key] = 'No local data to migrate';
        }
    }
    return results;
};
