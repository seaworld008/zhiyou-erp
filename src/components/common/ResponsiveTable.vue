<template>
  <div class="responsive-table-container">
    <!-- 表格工具栏 -->
    <div v-if="showToolbar" class="responsive-table__toolbar">
      <div class="toolbar-left">
        <slot name="toolbar-left">
          <h3 v-if="title" class="table-title">{{ title }}</h3>
        </slot>
      </div>
      <div class="toolbar-right">
        <slot name="toolbar-right">
          <!-- 搜索框 -->
          <el-input
            v-if="searchable"
            v-model="searchKeyword"
            placeholder="搜索..."
            :prefix-icon="Search"
            clearable
            style="width: 200px"
            @input="handleSearch"
          />
          <!-- 列设置 -->
          <el-dropdown v-if="columnSettable" trigger="click">
            <el-button :icon="Setting" circle />
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item
                  v-for="col in columns"
                  :key="col.prop"
                  @click="toggleColumn(col.prop)"
                >
                  <el-checkbox 
                    :model-value="!hiddenColumns.includes(col.prop)"
                    @change="toggleColumn(col.prop)"
                  >
                    {{ col.label }}
                  </el-checkbox>
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <!-- 刷新按钮 -->
          <el-button 
            v-if="refreshable"
            :icon="Refresh" 
            :loading="loading"
            circle
            @click="handleRefresh"
          />
        </slot>
      </div>
    </div>

    <!-- 表格主体 -->
    <div class="responsive-table__wrapper">
      <el-table
        ref="tableRef"
        v-loading="loading"
        :data="filteredData"
        :height="tableHeight"
        :max-height="maxHeight"
        :stripe="stripe"
        :border="border"
        :size="size"
        :empty-text="emptyText"
        :row-key="rowKey"
        :tree-props="treeProps"
        :expand-row-keys="expandRowKeys"
        :default-sort="defaultSort"
        :highlight-current-row="highlightCurrentRow"
        :row-class-name="rowClassName"
        :cell-class-name="cellClassName"
        :header-cell-class-name="headerCellClassName"
        :span-method="spanMethod"
        :summary-method="summaryMethod"
        :show-summary="showSummary"
        :sum-text="sumText"
        :select-on-indeterminate="selectOnIndeterminate"
        @select="handleSelect"
        @select-all="handleSelectAll"
        @selection-change="handleSelectionChange"
        @row-click="handleRowClick"
        @row-dblclick="handleRowDblclick"
        @row-contextmenu="handleRowContextmenu"
        @cell-click="handleCellClick"
        @cell-dblclick="handleCellDblclick"
        @cell-contextmenu="handleCellContextmenu"
        @header-click="handleHeaderClick"
        @header-contextmenu="handleHeaderContextmenu"
        @sort-change="handleSortChange"
        @filter-change="handleFilterChange"
        @current-change="handleCurrentChange"
        @header-dragend="handleHeaderDragend"
        @expand-change="handleExpandChange"
      >
        <!-- 选择列 -->
        <el-table-column
          v-if="selectable"
          type="selection"
          width="55"
          align="center"
          fixed="left"
        />
        
        <!-- 序号列 -->
        <el-table-column
          v-if="showIndex"
          type="index"
          label="序号"
          width="80"
          align="center"
          fixed="left"
        />
        
        <!-- 动态列 -->
        <template v-for="column in visibleColumns" :key="column.prop">
          <el-table-column
            v-if="column.type === 'expand'"
            type="expand"
            :width="column.width"
          >
            <template #default="{ row, $index }">
              <slot :name="`expand-${column.prop}`" :row="row" :index="$index" />
            </template>
          </el-table-column>
          
          <el-table-column
            v-else
            :prop="column.prop"
            :label="column.label"
            :width="column.width"
            :min-width="column.minWidth"
            :fixed="column.fixed"
            :sortable="column.sortable"
            :sort-method="column.sortMethod"
            :sort-by="column.sortBy"
            :sort-orders="column.sortOrders"
            :resizable="column.resizable"
            :formatter="column.formatter"
            :show-overflow-tooltip="column.showOverflowTooltip"
            :align="column.align"
            :header-align="column.headerAlign"
            :class-name="column.className"
            :label-class-name="column.labelClassName"
            :filters="column.filters"
            :filter-placement="column.filterPlacement"
            :filter-multiple="column.filterMultiple"
            :filter-method="column.filterMethod"
            :filtered-value="column.filteredValue"
          >
            <template v-if="column.headerSlot" #header="{ column: col, $index }">
              <slot :name="`header-${column.prop}`" :column="col" :index="$index" />
            </template>
            
            <template #default="{ row, column: col, $index }">
              <slot 
                v-if="column.slot" 
                :name="column.prop" 
                :row="row" 
                :column="col" 
                :index="$index"
                :value="row[column.prop]"
              />
              <span v-else>{{ row[column.prop] }}</span>
            </template>
          </el-table-column>
        </template>
        
        <!-- 操作列 -->
        <el-table-column
          v-if="$slots.actions"
          label="操作"
          :width="actionsWidth"
          :min-width="actionsMinWidth"
          :fixed="actionsFixed"
          align="center"
          class-name="actions-column"
        >
          <template #default="{ row, $index }">
            <slot name="actions" :row="row" :index="$index" />
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 分页器 -->
    <div v-if="pagination && total > 0" class="responsive-table__pagination">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="pageSizes"
        :total="total"
        :layout="paginationLayout"
        :background="true"
        :small="paginationSmall"
        @size-change="handleSizeChange"
        @current-change="handleCurrentPageChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { Search, Setting, Refresh } from '@element-plus/icons-vue'
import type { ElTable } from 'element-plus'

interface Column {
  prop: string
  label: string
  width?: string | number
  minWidth?: string | number
  fixed?: boolean | 'left' | 'right'
  sortable?: boolean | 'custom'
  sortMethod?: Function
  sortBy?: string | string[] | Function
  sortOrders?: string[]
  resizable?: boolean
  formatter?: Function
  showOverflowTooltip?: boolean
  align?: 'left' | 'center' | 'right'
  headerAlign?: 'left' | 'center' | 'right'
  className?: string
  labelClassName?: string
  filters?: Array<{ text: string; value: any }>
  filterPlacement?: string
  filterMultiple?: boolean
  filterMethod?: Function
  filteredValue?: any[]
  type?: 'expand'
  slot?: boolean
  headerSlot?: boolean
}

interface Props {
  data: any[]
  columns: Column[]
  loading?: boolean
  title?: string
  height?: string | number
  maxHeight?: string | number
  stripe?: boolean
  border?: boolean
  size?: 'large' | 'default' | 'small'
  emptyText?: string
  rowKey?: string | Function
  treeProps?: object
  expandRowKeys?: any[]
  defaultSort?: object
  highlightCurrentRow?: boolean
  rowClassName?: string | Function
  cellClassName?: string | Function
  headerCellClassName?: string | Function
  spanMethod?: Function
  summaryMethod?: Function
  showSummary?: boolean
  sumText?: string
  selectOnIndeterminate?: boolean
  selectable?: boolean
  showIndex?: boolean
  searchable?: boolean
  columnSettable?: boolean
  refreshable?: boolean
  showToolbar?: boolean
  pagination?: boolean
  total?: number
  pageSize?: number
  pageSizes?: number[]
  paginationLayout?: string
  paginationSmall?: boolean
  actionsWidth?: string | number
  actionsMinWidth?: string | number
  actionsFixed?: boolean | 'left' | 'right'
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  stripe: true,
  border: true,
  size: 'default',
  emptyText: '暂无数据',
  highlightCurrentRow: true,
  showSummary: false,
  sumText: '合计',
  selectOnIndeterminate: true,
  selectable: false,
  showIndex: false,
  searchable: true,
  columnSettable: true,
  refreshable: true,
  showToolbar: true,
  pagination: true,
  total: 0,
  pageSize: 20,
  pageSizes: () => [10, 20, 50, 100],
  paginationLayout: 'total, sizes, prev, pager, next, jumper',
  paginationSmall: false,
  actionsWidth: 150,
  actionsMinWidth: 120,
  actionsFixed: 'right'
})

const emit = defineEmits([
  'select',
  'select-all',
  'selection-change',
  'row-click',
  'row-dblclick',
  'row-contextmenu',
  'cell-click',
  'cell-dblclick',
  'cell-contextmenu',
  'header-click',
  'header-contextmenu',
  'sort-change',
  'filter-change',
  'current-change',
  'header-dragend',
  'expand-change',
  'size-change',
  'current-page-change',
  'refresh',
  'search'
])

const tableRef = ref<InstanceType<typeof ElTable>>()
const searchKeyword = ref('')
const hiddenColumns = ref<string[]>([])
const currentPage = ref(1)
const pageSize = ref(props.pageSize)

// 计算属性
const tableHeight = computed(() => {
  if (props.height) {
    return typeof props.height === 'number' ? `${props.height}px` : props.height
  }
  return undefined
})

const visibleColumns = computed(() => {
  return props.columns.filter(col => !hiddenColumns.value.includes(col.prop))
})

const filteredData = computed(() => {
  if (!searchKeyword.value) return props.data
  
  return props.data.filter(row => {
    return props.columns.some(col => {
      const value = row[col.prop]
      if (value == null) return false
      return String(value).toLowerCase().includes(searchKeyword.value.toLowerCase())
    })
  })
})

// 方法
const toggleColumn = (prop: string) => {
  const index = hiddenColumns.value.indexOf(prop)
  if (index > -1) {
    hiddenColumns.value.splice(index, 1)
  } else {
    hiddenColumns.value.push(prop)
  }
}

const handleSearch = () => {
  emit('search', searchKeyword.value)
}

const handleRefresh = () => {
  emit('refresh')
}

const handleSizeChange = (size: number) => {
  pageSize.value = size
  emit('size-change', size)
}

const handleCurrentPageChange = (page: number) => {
  currentPage.value = page
  emit('current-page-change', page)
}

// 表格事件处理
const handleSelect = (selection: any[], row: any) => {
  emit('select', selection, row)
}

const handleSelectAll = (selection: any[]) => {
  emit('select-all', selection)
}

const handleSelectionChange = (selection: any[]) => {
  emit('selection-change', selection)
}

const handleRowClick = (row: any, column: any, event: Event) => {
  emit('row-click', row, column, event)
}

const handleRowDblclick = (row: any, column: any, event: Event) => {
  emit('row-dblclick', row, column, event)
}

const handleRowContextmenu = (row: any, column: any, event: Event) => {
  emit('row-contextmenu', row, column, event)
}

const handleCellClick = (row: any, column: any, cell: any, event: Event) => {
  emit('cell-click', row, column, cell, event)
}

const handleCellDblclick = (row: any, column: any, cell: any, event: Event) => {
  emit('cell-dblclick', row, column, cell, event)
}

const handleCellContextmenu = (row: any, column: any, cell: any, event: Event) => {
  emit('cell-contextmenu', row, column, cell, event)
}

const handleHeaderClick = (column: any, event: Event) => {
  emit('header-click', column, event)
}

const handleHeaderContextmenu = (column: any, event: Event) => {
  emit('header-contextmenu', column, event)
}

const handleSortChange = (sort: any) => {
  emit('sort-change', sort)
}

const handleFilterChange = (filters: any) => {
  emit('filter-change', filters)
}

const handleCurrentChange = (currentRow: any, oldCurrentRow: any) => {
  emit('current-change', currentRow, oldCurrentRow)
}

const handleHeaderDragend = (newWidth: number, oldWidth: number, column: any, event: Event) => {
  emit('header-dragend', newWidth, oldWidth, column, event)
}

const handleExpandChange = (row: any, expandedRows: any[]) => {
  emit('expand-change', row, expandedRows)
}

// 暴露方法
defineExpose({
  tableRef,
  clearSelection: () => tableRef.value?.clearSelection(),
  toggleRowSelection: (row: any, selected?: boolean) => tableRef.value?.toggleRowSelection(row, selected),
  toggleAllSelection: () => tableRef.value?.toggleAllSelection(),
  toggleRowExpansion: (row: any, expanded?: boolean) => tableRef.value?.toggleRowExpansion(row, expanded),
  setCurrentRow: (row: any) => tableRef.value?.setCurrentRow(row),
  clearSort: () => tableRef.value?.clearSort(),
  clearFilter: (columnKeys?: string[]) => tableRef.value?.clearFilter(columnKeys),
  doLayout: () => tableRef.value?.doLayout(),
  sort: (prop: string, order: string) => tableRef.value?.sort(prop, order)
})
</script>

<style scoped lang="scss">
@import '@/styles/responsive.scss';

.responsive-table-container {
  background: var(--el-bg-color);
  border-radius: 8px;
  overflow: hidden;
  
  @include respond-to(lg) {
    border-radius: 12px;
  }
}

.responsive-table__toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  background: var(--el-bg-color-page);
  
  @include respond-to(md) {
    padding: 18px 24px;
  }
  
  @include respond-to(lg) {
    padding: 20px 28px;
  }
  
  .toolbar-left {
    display: flex;
    align-items: center;
    gap: 16px;
    
    .table-title {
      font-size: 16px;
      font-weight: 600;
      color: var(--el-text-color-primary);
      margin: 0;
      
      @include respond-to(lg) {
        font-size: 18px;
      }
    }
  }
  
  .toolbar-right {
    display: flex;
    align-items: center;
    gap: 12px;
    
    @include respond-to(lg) {
      gap: 16px;
    }
  }
}

.responsive-table__wrapper {
  overflow: auto;
  
  :deep(.el-table) {
    .el-table__header {
      th {
        background: var(--el-bg-color-page);
        font-weight: 600;
        color: var(--el-text-color-primary);
        
        @include respond-to(lg) {
          padding: 16px 0;
        }
      }
    }
    
    .el-table__body {
      tr {
        transition: all 0.3s ease;
        
        &:hover {
          background: var(--el-bg-color-page);
        }
        
        td {
          @include respond-to(lg) {
            padding: 14px 0;
          }
        }
      }
    }
    
    .actions-column {
      .el-button {
        margin: 0 2px;
        
        @include respond-to(lg) {
          margin: 0 4px;
        }
      }
    }
  }
}

.responsive-table__pagination {
  padding: 16px 20px;
  display: flex;
  justify-content: flex-end;
  background: var(--el-bg-color-page);
  border-top: 1px solid var(--el-border-color-lighter);
  
  @include respond-to(md) {
    padding: 18px 24px;
  }
  
  @include respond-to(lg) {
    padding: 20px 28px;
  }
  
  :deep(.el-pagination) {
    .el-pagination__total,
    .el-pagination__jump {
      @include respond-below(md) {
        display: none;
      }
    }
  }
}

// 工厂主题优化
[data-theme="factory"] {
  .responsive-table-container {
    background: linear-gradient(135deg, rgba(0, 216, 255, 0.1) 0%, rgba(0, 27, 46, 0.8) 100%);
    border: 1px solid rgba(0, 216, 255, 0.3);
    backdrop-filter: blur(10px);
  }
  
  .responsive-table__toolbar {
    background: rgba(0, 27, 46, 0.6);
    border-bottom-color: rgba(0, 216, 255, 0.3);
  }
  
  .responsive-table__pagination {
    background: rgba(0, 27, 46, 0.6);
    border-top-color: rgba(0, 216, 255, 0.3);
  }
}

// 暗黑主题优化
[data-theme="dark"] {
  .responsive-table-container {
    background: var(--el-bg-color-overlay);
  }
  
  .responsive-table__toolbar {
    background: var(--el-bg-color);
    border-bottom-color: var(--el-border-color-darker);
  }
  
  .responsive-table__pagination {
    background: var(--el-bg-color);
    border-top-color: var(--el-border-color-darker);
  }
}
</style>