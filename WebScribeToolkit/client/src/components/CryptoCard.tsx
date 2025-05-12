import { CryptoAsset } from "../types/crypto";
import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

interface CryptoCardProps {
  asset: CryptoAsset;
  chartData?: number[];
}

export function CryptoCard({ asset, chartData = [] }: CryptoCardProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart<"line"> | null>(null);

  useEffect(() => {
    if (!chartRef.current || chartData.length === 0) return;
    
    // Clear previous chart if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    // Create new chart
    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: Array(chartData.length).fill(''),
        datasets: [{
          data: chartData,
          borderColor: asset.color,
          backgroundColor: `${asset.color}20`,
          borderWidth: 2,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            enabled: false
          }
        },
        elements: {
          point: {
            radius: 0
          },
          line: {
            tension: 0.4
          }
        },
        scales: {
          x: {
            display: false
          },
          y: {
            display: false
          }
        }
      }
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [asset, chartData]);

  const priceChangeClass = asset.priceChangePercentage24h >= 0 
    ? "text-green-500" 
    : "text-red-500";

  const priceChangeIcon = asset.priceChangePercentage24h >= 0 
    ? <i className="fas fa-arrow-up"></i> 
    : <i className="fas fa-arrow-down"></i>;

  return (
    <div className="crypto-card bg-white rounded-lg border border-gray-200 overflow-hidden dark:bg-gray-700 dark:border-gray-600">
      <div className="p-5">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-3">
            <div className={`token-icon bg-${asset.symbol.toLowerCase()} text-white`}>
              <i className={asset.icon}></i>
            </div>
            <div>
              <h3 className="font-semibold">{asset.symbol}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">{asset.name}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-semibold">${asset.currentPrice.toFixed(asset.currentPrice < 1 ? 4 : 2)}</p>
            <p className={`text-xs ${priceChangeClass}`}>
              {priceChangeIcon} {Math.abs(asset.priceChangePercentage24h).toFixed(1)}%
            </p>
          </div>
        </div>
        <div className="flex justify-between items-center mb-2">
          <p className="text-sm text-gray-500 dark:text-gray-400">Balance</p>
          <p className="font-medium">{asset.balance} {asset.symbol}</p>
        </div>
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Value</p>
          <p className="font-medium">${(asset.balance * asset.currentPrice).toFixed(2)}</p>
        </div>
        <div className="h-16">
          <canvas ref={chartRef} width="100%" height="100%"></canvas>
        </div>
      </div>
      <div className="border-t border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 px-5 py-3 flex justify-between">
        <button className="text-xs text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300">
          <i className="fas fa-exchange-alt mr-1"></i> Swap
        </button>
        <button className="text-xs text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300">
          <i className="fas fa-external-link-alt mr-1"></i> Details
        </button>
      </div>
    </div>
  );
}
