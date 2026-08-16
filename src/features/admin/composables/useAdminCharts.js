import { onBeforeUnmount, ref, shallowRef } from 'vue'
import {
  ArcElement,
  BarController,
  BarElement,
  CategoryScale,
  Chart,
  DoughnutController,
  Filler,
  Legend,
  LineController,
  LineElement,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js'

Chart.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  LineController,
  BarController,
  DoughnutController,
  Filler,
  Legend,
  Tooltip,
  Title,
)

const NAVY = '#12202e'
const GOLD = '#c9922a'
const GREEN = '#2a7a50'
const BLUE = '#2563eb'
const RED = '#c0392b'
const PURPLE = '#6d28d9'

function mkGrad(ctx, c1, c2) {
  const g = ctx.createLinearGradient(0, 0, 0, 200)
  g.addColorStop(0, c1)
  g.addColorStop(1, c2)
  return g
}

export function useAdminCharts() {
  const instances = shallowRef([])

  function track(chart) {
    instances.value = [...instances.value, chart]
    return chart
  }

  function destroyAll() {
    instances.value.forEach((c) => c.destroy())
    instances.value = []
  }

  function renderLine(canvas, labels, data) {
    if (!canvas) return null
    const ctx = canvas.getContext('2d')
    const g = mkGrad(ctx, 'rgba(201,146,42,.22)', 'rgba(201,146,42,.02)')
    return track(
      new Chart(ctx, {
        type: 'line',
        data: {
          labels,
          datasets: [{
            data,
            borderColor: GOLD,
            backgroundColor: g,
            borderWidth: 2.5,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: GOLD,
            pointRadius: 3,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: { beginAtZero: true, suggestedMin: 0, ticks: { callback: (v) => `${v}tr` } },
          },
        },
      }),
    )
  }

  function renderDoughnut(canvas, labels, data, colors = [GREEN, BLUE, GOLD, RED]) {
    if (!canvas) return null
    const ctx = canvas.getContext('2d')
    
    const isEmpty = !data || data.length === 0 || data.every(v => Number(v) === 0)
    const renderLabels = isEmpty ? ['Chưa có dữ liệu'] : labels
    const renderData = isEmpty ? [1] : data
    const renderColors = isEmpty ? ['#e2e8f0'] : colors

    return track(
      new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: renderLabels,
          datasets: [{ 
            data: renderData, 
            backgroundColor: renderColors, 
            borderWidth: 0, 
            hoverOffset: isEmpty ? 0 : 6 
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { 
            legend: { position: 'right', labels: { boxWidth: 10, font: { size: 11 } } },
            tooltip: {
              callbacks: {
                label: (context) => {
                  if (isEmpty) return ' Chưa có dữ liệu'
                  return ` ${context.label}: ${context.raw}`
                }
              }
            }
          },
          cutout: '66%',
        },
      }),
    )
  }

  function renderBar(canvas, labels, data, color = BLUE) {
    if (!canvas) return null
    const ctx = canvas.getContext('2d')
    return track(
      new Chart(ctx, {
        type: 'bar',
        data: { labels, datasets: [{ data, backgroundColor: color, borderRadius: 6 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, suggestedMin: 0 } } },
      }),
    )
  }

  function renderRevenueBar(canvas, labels, data) {
    if (!canvas) return null
    const ctx = canvas.getContext('2d')
    const g = mkGrad(ctx, 'rgba(201,146,42,.28)', 'rgba(201,146,42,.02)')
    return track(
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels,
          datasets: [{ data, backgroundColor: g, borderRadius: 5, borderColor: GOLD, borderWidth: 1.5 }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true, suggestedMin: 0, ticks: { callback: (v) => `${v}tr` } } },
        },
      }),
    )
  }

  function renderPie(canvas, labels, data) {
    if (!canvas) return null
    const ctx = canvas.getContext('2d')
    
    const isEmpty = !data || data.length === 0 || data.every(v => Number(v) === 0)
    const renderLabels = isEmpty ? ['Chưa có dữ liệu'] : labels
    const renderData = isEmpty ? [1] : data
    const renderColors = isEmpty ? ['#e2e8f0'] : [NAVY, GOLD, BLUE, GREEN, PURPLE]

    return track(
      new Chart(ctx, {
        type: 'pie',
        data: {
          labels: renderLabels,
          datasets: [{ data: renderData, backgroundColor: renderColors, borderWidth: 0 }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { 
            legend: { position: 'right', labels: { boxWidth: 10, font: { size: 11 } } },
            tooltip: {
              callbacks: {
                label: (context) => {
                  if (isEmpty) return ' Chưa có dữ liệu'
                  return ` ${context.label}: ${context.raw}`
                }
              }
            }
          },
        },
      }),
    )
  }

  onBeforeUnmount(destroyAll)

  return { renderLine, renderDoughnut, renderBar, renderRevenueBar, renderPie, destroyAll }
}
