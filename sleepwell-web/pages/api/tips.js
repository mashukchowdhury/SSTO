import { query } from "firebase/firestore";
import { collection, getDocs } from "firebase/firestore/lite";
import { db } from "../../components/Firebase";


export async function getPrescriptions(uid = localStorage.getItem('uid')) {

  const prescriptionsRef = collection(db, "users", uid, "prescriptions")
  const preQuery = query(prescriptionsRef)
  const prescriptions = await getDocs(preQuery)

  let data = ''
  prescriptions.forEach((doc) => {
    data = doc.data()
  })
  return data
}