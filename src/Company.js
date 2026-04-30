import { useEffect, useState } from "react";
import { auth, db } from "./firebase";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";

function Company() {
  const [company, setCompany] = useState(null);
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    const loadCompany = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const userSnap = await getDoc(doc(db, "users", user.uid));
      const userData = userSnap.data();

      if (!userData?.companyId) return;

      // GET COMPANY
      const companySnap = await getDoc(doc(db, "companies", userData.companyId));
      setCompany(companySnap.data());

      // GET EMPLOYEES
      const q = query(
        collection(db, "users"),
        where("companyId", "==", userData.companyId)
      );

      const querySnap = await getDocs(q);

      const list = querySnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      setEmployees(list);
    };

    loadCompany();
  }, []);

  return (
    <div style={{ padding: "40px", color: "white" }}>
      <h1>Company Dashboard</h1>

      {!company && <p>No company found</p>}

      {company && (
        <>
          <h2>{company.name}</h2>

          <h3 style={{ marginTop: "20px" }}>Employees</h3>

          {employees.map(emp => (
            <div key={emp.id} style={{ marginTop: "10px" }}>
              {emp.email}
            </div>
          ))}
        </>
      )}
    </div>
  );
}

export default Company;