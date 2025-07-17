<template>
  <div class="abnormal-donut-chart">
    <div ref="chartRef" :style="{ width: '100%', height: height + 'px' }"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import * as echarts from 'echarts'
import type { AbnormalItem } from '@/types'

interface Props {
  data: AbnormalItem[]
  height?: number
}

const props = withDefaults(defineProps<Props>(), {
  height: 300
})

const chartRef = ref<HTMLDivElement>()
let chartInstance: echarts.ECharts | null = null

// 颜色配置
const colors = [
  '#ff6b6b', // 设备故障 - 红色
  '#4ecdc4', // 物料异常 - 青色  
  '#45b7d1', // 人员缺勤 - 蓝色
  '#f9ca24', // 其他原因 - 黄色
  '#67c23a', // 正常生产 - 绿色
  '#e17055', // 备用色
  '#74b9ff', // 备用色
  '#a29bfe'  // 备用色
]

const initChart = () => {
  if (!chartRef.value) return

  chartInstance = echarts.init(chartRef.value)
  
  const option: echarts.EChartsOption = {
    title: {
      text: '异常分布统计',
      left: 'center',
      textStyle: {
        fontSize: 14,
        fontWeight: 'normal'
      }
    },
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        const percent = params.percent ? params.percent.toFixed(1) : '0.0'
        return `${params.name}<br/>数量: ${params.value}<br/>占比: ${percent}%`
      }
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      top: 'center',
      textStyle: {
        fontSize: 12
      },
      itemWidth: 14,
      itemHeight: 14
    },
    series: [
      {
        name: '异常分布',
        type: 'pie',
        radius: ['45%', '75%'], // 环形图
        center: ['60%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 8,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: true,
          position: 'outside',
          formatter: (params: any) => {
            const percent = params.percent ? params.percent.toFixed(1) : '0.0'
            return `${params.name}\n${percent}%`
          },
          fontSize: 11
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 'bold'
          },
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        labelLine: {
          show: true,
          smooth: true,
          length: 10,
          length2: 20
        },
        data: props.data.map((item, index) => ({
          value: item.value,
          name: item.type,
          itemStyle: {
            color: colors[index % colors.length]
          }
        }))
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
    series: [
      {
        data: props.data.map((item, index) => ({
          value: item.value,
          name: item.type,
          itemStyle: {
            color: colors[index % colors.length]
          }
        }))
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
.abnormal-donut-chart {
  width: 100%;
  height: 100%;
}
</style> 