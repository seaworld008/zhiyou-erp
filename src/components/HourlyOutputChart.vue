<template>
  <div class="hourly-output-chart">
    <div ref="chartRef" :style="{ width: '100%', height: height + 'px' }"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import * as echarts from 'echarts'
import type { HourlyOutputPoint } from '@/types'

interface Props {
  data: HourlyOutputPoint[]
  height?: number
}

const props = withDefaults(defineProps<Props>(), {
  height: 300
})

const chartRef = ref<HTMLDivElement>()
let chartInstance: echarts.ECharts | null = null

const initChart = () => {
  if (!chartRef.value) return

  chartInstance = echarts.init(chartRef.value)
  
  const option: echarts.EChartsOption = {
    title: {
      text: '每小时产量趋势',
      left: 'center',
      textStyle: {
        fontSize: 14,
        fontWeight: 'normal'
      }
    },
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        const data = params[0]
        return `${data.name}<br/>产量: ${data.value} pcs`
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: props.data.map(item => item.hour),
      axisLabel: {
        interval: 0,
        rotate: 45
      }
    },
    yAxis: {
      type: 'value',
      name: '产量(pcs)',
      nameTextStyle: {
        fontSize: 12
      },
      axisLabel: {
        formatter: '{value}'
      }
    },
    series: [
      {
        name: '产量',
        type: 'bar',
        data: props.data.map(item => item.qty),
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#83bff6' },
            { offset: 0.5, color: '#188df0' },
            { offset: 1, color: '#188df0' }
          ]),
          borderRadius: [4, 4, 0, 0]
        },
        emphasis: {
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#2378f7' },
              { offset: 0.7, color: '#2378f7' },
              { offset: 1, color: '#83bff6' }
            ])
          }
        },
        label: {
          show: true,
          position: 'top',
          formatter: '{c}',
          fontSize: 10,
          color: '#666'
        }
      }
    ],
    animation: true,
    animationDuration: 1000,
    animationEasing: 'cubicOut'
  }

  chartInstance.setOption(option)
}

const updateChart = () => {
  if (!chartInstance) return

  const option: echarts.EChartsOption = {
    xAxis: {
      data: props.data.map(item => item.hour)
    },
    series: [
      {
        data: props.data.map(item => item.qty)
      }
    ]
  }

  chartInstance.setOption(option, { notMerge: false })
}

// 监听数据变化
watch(() => props.data, () => {
  nextTick(() => {
    updateChart()
  })
}, { deep: true })

// 监听窗口大小变化
const handleResize = () => {
  if (chartInstance) {
    chartInstance.resize()
  }
}

onMounted(() => {
  nextTick(() => {
    initChart()
    window.addEventListener('resize', handleResize)
  })
})

onUnmounted(() => {
  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.hourly-output-chart {
  width: 100%;
  height: 100%;
}
</style> 