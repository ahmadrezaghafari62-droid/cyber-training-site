import { useEffect, useState } from "react";
import { db } from "./firebase";
import { collection, onSnapshot } from "firebase/firestore";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

function Admin() {
  const [users, setUsers] = useState([]);
  const [progressData, setProgressData] = useState({});
  const [companyStats, setCompanyStats] = useState([]);

  /* ================= RISK ================= */

  const getRiskLevel = (avg) => {
    if (avg >= 80) return { label: "LOW", icon: "🟢" };
    if (avg >= 50) return { label: "MEDIUM", icon: "🟡" };
    return { label: "HIGH", icon: "🔴" };
  };

  /* ================= LOAD USERS ================= */

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsers(list);
    });

    return () => unsubscribe();
  }, []);

  /* ================= LOAD PROGRESS ================= */

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "progress"), (snapshot) => {
      const map = {};
      snapshot.docs.forEach((doc) => {
        map[doc.id] = doc.data();
      });
      setProgressData(map);
    });

    return () => unsubscribe();
  }, []);

  /* ================= CALCULATE COMPANY ANALYTICS ================= */

  useEffect(() => {
    const companyMap = {};

    users.forEach((user) => {
      const userProgress = progressData[user.id];
      if (!userProgress) return;

      let totalScore = 0;
      let totalPossible = 0;

      Object.values(userProgress).forEach((course) => {
        if (course.score !== undefined) {
          totalScore += course.score;
          totalPossible += course.total;
        }
      });

      const avg =
        totalPossible > 0
          ? Math.round((totalScore / totalPossible) * 100)
          : 0;

      if (!companyMap[user.company]) {
        companyMap[user.company] = {
          totalUsers: 0,
          totalScore: 0
        };
      }

      companyMap[user.company].totalUsers += 1;
      companyMap[user.company].totalScore += avg;
    });

    const result = Object.entries(companyMap).map(([company, data]) => ({
      company,
      avgRisk: Math.round(data.totalScore / data.totalUsers),
      users: data.totalUsers
    }));

    setCompanyStats(result);
  }, [users, progressData]);

  /* ================= LEADERBOARD ================= */

  const sortedCompanies = [...companyStats].sort(
    (a, b) => b.avgRisk - a.avgRisk
  );

  /* ================= ALERTS ================= */

  const alerts = [];

  sortedCompanies.forEach((company) => {
    if (company.avgRisk < 50) {
      alerts.push(`🚨 ${company.company} is HIGH RISK`);
    } else if (company.avgRisk < 70) {
      alerts.push(`⚠️ ${company.company} needs improvement`);
    }
  });

  /* ================= UI ================= */

  return (
    <div
      style={{
        background: "#020617",
        minHeight: "100vh",
        color: "white",
        padding: "40px"
      }}
    >
      <h1 style={{ textAlign: "center" }}>
        🏢 Company Analytics Dashboard
      </h1>

      {/* ================= ALERTS ================= */}
      <h2 style={{ marginTop: "30px" }}>⚠️ Alerts</h2>

      {alerts.length === 0 ? (
        <p style={{ color: "#94a3b8" }}>No alerts</p>
      ) : (
        alerts.map((alert, i) => (
          <div
            key={i}
            style={{
              background: "#7f1d1d",
              padding: "12px",
              borderRadius: "8px",
              marginTop: "10px"
            }}
          >
            {alert}
          </div>
        ))
      )}

      {/* ================= LEADERBOARD ================= */}
      <h2 style={{ marginTop: "40px" }}>🏆 Company Leaderboard</h2>

      {sortedCompanies.map((c, index) => {
        const risk = getRiskLevel(c.avgRisk);

        return (
          <div
            key={index}
            style={{
              background: "#0f172a",
              padding: "15px",
              marginTop: "10px",
              borderRadius: "10px",
              display: "flex",
              justifyContent: "space-between"
            }}
          >
            <span>
              #{index + 1} {c.company}
            </span>
            <span>
              {risk.icon} {c.avgRisk}%
            </span>
          </div>
        );
      })}

      {/* ================= CHART ================= */}
      <h2 style={{ marginTop: "40px" }}>
        Company Risk Comparison
      </h2>

      <div style={{ width: "100%", height: 300 }}>
        <ResponsiveContainer>
          <BarChart data={companyStats}>
            <XAxis dataKey="company" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="avgRisk" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ================= COMPANY TABLE ================= */}
      <h2 style={{ marginTop: "40px" }}>
        Company Overview
      </h2>

      {companyStats.map((c, index) => (
        <div
          key={index}
          style={{
            background: "#0f172a",
            padding: "20px",
            marginTop: "10px",
            borderRadius: "10px"
          }}
        >
          <h3>{c.company}</h3>
          <p>👥 Users: {c.users}</p>
          <p>📊 Avg Risk Score: {c.avgRisk}%</p>
        </div>
      ))}
    </div>
  );
}

export default Admin;