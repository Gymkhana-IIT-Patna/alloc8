import React, { useEffect, useState } from "react";
import { getName, getRollNumber } from "@/lib/auth_utility";
import { useMsal } from "@azure/msal-react";
import { BrowserAuthError, InteractionRequiredAuthError } from "@azure/msal-browser";
import { useNavigate } from "react-router";

export default function GetSMP() {
  const { accounts, instance } = useMsal();
  const navigate = useNavigate();

  const [idToken, setIdToken] = useState(null);
  const [idTokenClaims, setIdTokenClaims] = useState(null);
  const [loadingToken, setLoadingToken] = useState(true);

  const [clusterData, setClusterData] = useState(null);
  const [loadingCluster, setLoadingCluster] = useState(false);
  const [error, setError] = useState(null);

  const silentRequest = { scopes: [] };
  const accessTokenRequest = { account: accounts && accounts[0] ? accounts[0] : null };

  useEffect(() => {
    let mounted = true;
    setLoadingToken(true);

    instance.acquireTokenSilent(silentRequest)
      .then((tokenResponse) => {
        if (!mounted) return;
        setIdToken(tokenResponse.idToken);
        setIdTokenClaims(tokenResponse.idTokenClaims);
      })
      .catch((err) => {
        if (err instanceof InteractionRequiredAuthError) {
          try {
            instance.acquireTokenRedirect(silentRequest);
          } catch (redirectErr) {
            console.error("Redirect failed:", redirectErr);
          }
        } else if (err instanceof BrowserAuthError) {
          navigate("/");
        } else {
          console.warn("Silent token acquisition failed:", err);
        }
      })
      .finally(() => {
        if (mounted) setLoadingToken(false);
      });

    return () => { mounted = false; };
  }, [instance]);

  const fetchCluster = async () => {
    setError(null);
    setClusterData(null);

    // require an account to be present
    if (!accessTokenRequest.account) {
      setError("No signed-in account found.");
      return;
    }

    setLoadingCluster(true);
    try {
      const tokenResponse = await instance.acquireTokenSilent(accessTokenRequest);
      const idTok = tokenResponse.idToken;

      const base = import.meta.env.VITE_SERVER_URL || "http://localhost:8500";
      const resp = await fetch(`${base}/api/smp/get-cluster`, {
        method: "GET",
        headers: {
          "Accept": "application/json",
          "X-Alloc8-IDToken": idTok,
        },
      });

      if (!resp.ok) {
        if (resp.status === 404) {
          const body = await resp.json().catch(() => ({}));
          setError(body.message || "Cluster not found for current user.");
        } else {
          const txt = await resp.text().catch(() => "");
          setError(`Server returned ${resp.status}: ${txt}`);
        }
        setClusterData(null);
      } else {
        const json = await resp.json();
        setClusterData(json);
      }
    } catch (err) {
      console.error("fetchCluster error:", err);
      setError(err.message || "Error fetching cluster");
      setClusterData(null);
    } finally {
      setLoadingCluster(false);
    }
  };

  useEffect(() => {
    if (!accessTokenRequest.account) return;
    fetchCluster();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessTokenRequest.account, instance, idToken]);

  // UI for testing <To Be changed>
  if (loadingToken) {
    return <div>Acquiring token…</div>;
  }

  return (
    <div style={{ padding: 12 }}>
      <div>
        <strong>{getName(idTokenClaims) || "User"}</strong> — {getRollNumber(idTokenClaims) || ""}
      </div>

      <div style={{ marginTop: 12 }}>
        <button onClick={fetchCluster} disabled={loadingCluster || !accessTokenRequest.account}>
          {loadingCluster ? "Loading…" : "Get Cluster"}
        </button>
      </div>

      {error && (
        <div style={{ color: "red", marginTop: 12 }}>
          Error: {error}
        </div>
      )}

      {clusterData && (
        <div style={{ marginTop: 12 }}>
          <h4>Cluster response:</h4>
          <pre style={{ whiteSpace: "pre-wrap", maxHeight: "60vh", overflow: "auto" }}>
            {JSON.stringify(clusterData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
