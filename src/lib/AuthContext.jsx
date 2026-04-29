import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./firebase";

const AuthContext = createContext({
  user: null,
  role: null,
  profile: null,
  loading: true,
  refreshRole: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchRole = async (uid, forceUpdate = {}, retryCount = 0) => {
    try {
      const userDoc = await getDoc(doc(db, "users", uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        if (Object.keys(forceUpdate).length > 0) {
           const updatedProfile = { ...data, ...forceUpdate };
           await setDoc(doc(db, "users", uid), updatedProfile, { merge: true });
           setRole(updatedProfile.role || data.role);
           setProfile(updatedProfile);
        } else {
           setRole(data.role);
           setProfile(data);
        }
      } else {
        const newRole = auth.currentUser?.email === 'manish847593@gmail.com' ? 'admin' : 'user';
        const newProfile = {
          uid,
          email: auth.currentUser?.email,
          displayName: forceUpdate.displayName || auth.currentUser?.displayName || 'User',
          photoURL: auth.currentUser?.photoURL || '',
          role: newRole,
          createdAt: serverTimestamp(),
          ...forceUpdate
        };
        await setDoc(doc(db, "users", uid), newProfile);
        setRole(newRole);
        setProfile(newProfile);
      }
    } catch (error) {
      console.error("Error fetching user role:", error);
      // Soft retry for "offline" errors
      if (retryCount < 2 && (error.message?.includes('offline') || error.message?.includes('Cloud Firestore backend'))) {
        setTimeout(() => fetchRole(uid, forceUpdate, retryCount + 1), 2000);
      }
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        await fetchRole(user.uid);
      } else {
        setRole(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const refreshRole = async (updates = {}) => {
    if (user) await fetchRole(user.uid, updates);
  };

  return (
    <AuthContext.Provider value={{ user, role, profile, loading, refreshRole }}>
      {children}
    </AuthContext.Provider>
  );
}
