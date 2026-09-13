import React, { useEffect, useRef, useState } from "react";
import { Network } from "vis-network/standalone";

interface Node {
  id: string;
  label: string;
  group: string;
  title?: string;
  color?: string;
}

interface Edge {
  from: string;
  to: string;
  label?: string;
}

interface EvidenceGraphProps {
  graph?: {
    nodes?: Array<{ id: string; type: string; value: string; metadata?: any }>;
    edges?: Array<{ source: string; target: string; relationship: string }>;
  };
  evidenceGraph?: {
    nodes?: Array<{ id: string; type: string; value: string; metadata?: any }>;
    edges?: Array<{ source: string; target: string; relationship: string }>;
  };
  analysisData?: any;
}

export const EvidenceGraph: React.FC<EvidenceGraphProps> = ({ graph, evidenceGraph, analysisData }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedNode, setSelectedNode] = useState<any>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Build nodes & edges from props or fallback to analysisData
    const rawNodes = (graph || evidenceGraph)?.nodes || [];
    const rawEdges = (graph || evidenceGraph)?.edges || [];

    if (rawNodes.length === 0 && analysisData) {
      // Build from analysis data
      const nodes: Node[] = [];
      const edges: Edge[] = [];

      const emailId = `email:${analysisData.analysis_id || "target"}`;
      nodes.push({ id: emailId, label: analysisData.subject || "Email Analysis", group: "email", color: "#06b6d4" });

      const sender = analysisData.sender?.address || analysisData.from;
      if (sender) {
        const senderId = `sender:${sender}`;
        nodes.push({ id: senderId, label: sender, group: "sender", color: "#22c55e" });
        edges.push({ from: emailId, to: senderId, label: "sent_by" });
      }

      const iocs = analysisData.ioc_extraction || analysisData.iocs || {};
      (iocs.domains || []).forEach((d: string) => {
        const id = `domain:${d}`;
        nodes.push({ id, label: d, group: "domain", color: "#f59e0b" });
        edges.push({ from: emailId, to: id, label: "mentions_domain" });
      });

      (iocs.ip_addresses || iocs.ips || []).forEach((ip: string) => {
        const id = `ip:${ip}`;
        nodes.push({ id, label: ip, group: "ip", color: "#ef4444" });
        edges.push({ from: emailId, to: id, label: "references_ip" });
      });

      (iocs.urls || []).forEach((u: string) => {
        const shortU = u.length > 30 ? u.substring(0, 27) + "..." : u;
        const id = `url:${u}`;
        nodes.push({ id, label: shortU, title: u, group: "url", color: "#a855f7" });
        edges.push({ from: emailId, to: id, label: "contains_url" });
      });

      renderNetwork(nodes, edges);
    } else {
      const nodes: Node[] = rawNodes.map((n) => ({
        id: n.id || `${n.type}:${n.value}`,
        label: n.value || n.id,
        group: n.type || "node",
        color: getColorForType(n.type),
      }));
      const edges: Edge[] = rawEdges.map((e) => ({
        from: e.source,
        to: e.target,
        label: e.relationship,
      }));
      renderNetwork(nodes, edges);
    }
  }, [evidenceGraph, analysisData]);

  const renderNetwork = (nodes: Node[], edges: Edge[]) => {
    if (!containerRef.current) return;
    const data = {
      nodes,
      edges,
    };
    const options = {
      nodes: {
        shape: "dot",
        size: 16,
        font: { color: "#e2e8f0", size: 12 },
        borderWidth: 2,
      },
      edges: {
        width: 1.5,
        color: { color: "#475569", highlight: "#58d6c0" },
        font: { color: "#94a3b8", size: 10, align: "middle" },
        arrows: { to: { enabled: true, scaleFactor: 0.5 } },
      },
      physics: {
        barnesHut: { gravitationalConstant: -2000, centralGravity: 0.3, springLength: 90 },
      },
      interaction: { hover: true, zoomView: true, dragNodes: true },
    };

    const network = new Network(containerRef.current, data, options);
    network.on("click", (params: any) => {
      if (params.nodes.length > 0) {
        setSelectedNode(params.nodes[0]);
      }
    });
  };

  const getColorForType = (type: string) => {
    switch (type) {
      case "email": return "#06b6d4";
      case "sender": return "#22c55e";
      case "domain": return "#f59e0b";
      case "ip": return "#ef4444";
      case "url": return "#a855f7";
      default: return "#64748b";
    }
  };

  return (
    <div className="bg-[#0c171c] border border-[#1b3037] rounded-xl p-4 shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-[#8ce2d0] uppercase tracking-wider">
          Interactive Evidence & IOC Network Graph
        </h3>
        <span className="text-xs text-slate-400">Drag nodes to rearrange • Scroll to zoom</span>
      </div>
      <div ref={containerRef} className="w-full h-[450px] rounded-lg bg-[#080d10] border border-[#1b3037]" />
      {selectedNode && (
        <div className="mt-2 p-2 bg-[#1b3037] rounded text-xs text-slate-300 flex justify-between items-center">
          <span>Selected Node: <strong className="text-[#58d6c0]">{selectedNode}</strong></span>
          <button onClick={() => setSelectedNode(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}
    </div>
  );
};
