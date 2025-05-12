import { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";
import { CryptoAsset } from "../types/crypto";

interface ActivityChartProps {
  assets: CryptoAsset[];
  historicalData: Record<string, number[]>;
}

export function ActivityChart({ assets, historicalData }: ActivityChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);
  const [timeframe, setTimeframe] = useState("7d");
  const [selectedTokens, setSelectedTokens] = useState("all");

  useEffect(() => {
    if (!chartRef.current) return;
    
    // Clear previous chart if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    // Filter assets based on selection
    let filteredAssets = assets;
    if (selectedTokens === "m2e") {
      filteredAssets = assets.filter(asset => ['GST', 'SAND', 'GMT'].includes(asset.symbol));
    } else if (selectedTokens === "crypto") {
      filteredAssets = assets.filter(asset => ['ETH', 'BTC', 'LTC'].includes(asset.symbol));
    }

    // Determine labels based on timeframe
    let labels: string[] = [];
    switch(timeframe) {
      case "7d":
        labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        break;
      case "30d":
        labels = Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`);
        break;
      case "90d":
        labels = Array.from({ length: 12 }, (_, i) => `Week ${i + 1}`);
        break;
      case "ytd":
        labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        break;
    }

    // Create datasets for each selected asset
    const datasets = filteredAssets.map(asset => {
      // Use historical data if available, or generate random data
      const data = historicalData[asset.id] || 
        Array(labels.length).fill(0).map(() => Math.floor(Math.random() * 10) - 5);
      
      return {
        label: asset.symbol,
        data: data,
        borderColor: asset.color,
        backgroundColor: 'transparent',
        borderWidth: 2
      };
    });

    // Determine if dark mode is active
    const isDark = document.documentElement.classList.contains('dark');
    const textColor = isDark ? '#f3f4f6' : '#1f2937';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

    // Create chart
    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        plugins: {
          legend: {
            position: 'top',
            labels: {
              color: textColor,
              usePointStyle: true,
              pointStyle: 'circle'
            }
          }
        },
        scales: {
          x: {
            grid: {
              color: gridColor
            },
            ticks: {
              color: textColor
            }
          },
          y: {
            grid: {
              color: gridColor
            },
            ticks: {
              color: textColor
            }
          }
        }
      }
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [assets, historicalData, timeframe, selectedTokens]);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-8 dark:bg-gray-800">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h2 className="text-xl font-bold">Market Activity</h2>
        <div className="mt-4 sm:mt-0 flex space-x-2">
          <select 
            className="text-sm border border-gray-300 rounded-md px-3 py-1.5 bg-white dark:bg-gray-700 dark:border-gray-600"
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="ytd">Year to date</option>
          </select>
          <select 
            className="text-sm border border-gray-300 rounded-md px-3 py-1.5 bg-white dark:bg-gray-700 dark:border-gray-600"
            value={selectedTokens}
            onChange={(e) => setSelectedTokens(e.target.value)}
          >
            <option value="all">All tokens</option>
            <option value="m2e">M2E tokens</option>
            <option value="crypto">Cryptocurrencies</option>
          </select>
        </div>
      </div>
      
      <div className="h-80">
        <canvas ref={chartRef}></canvas>
      </div>
    </div>
  );
}
