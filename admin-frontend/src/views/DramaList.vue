<template>
  <div>
    <div class="page-header">
      <h2>剧目管理</h2>
      <el-button type="primary" @click="openForm()">
        <el-icon><Plus /></el-icon>
        新增剧目
      </el-button>
    </div>

    <div class="search-bar">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索剧目标题"
        style="width: 240px;"
        clearable
        @clear="fetchList"
        @keyup.enter="fetchList"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      <el-button @click="fetchList">搜索</el-button>
    </div>

    <el-table :data="list" v-loading="loading" border stripe>
      <el-table-column prop="id" label="ID" width="70" />
      <el-table-column label="封面" width="80">
        <template #default="{ row }">
          <img
            v-if="row.coverUrl"
            :src="row.coverUrl"
            class="cover-thumb"
            alt="封面"
          />
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column prop="title" label="标题" min-width="180" show-overflow-tooltip />
      <el-table-column prop="category" label="分类" width="100" />
      <el-table-column prop="episodeCount" label="集数" width="80" align="center" />
      <el-table-column prop="playCount" label="播放量" width="100" align="center" />
      <el-table-column label="状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'info'">
            {{ row.status === 1 ? '已上架' : '已下架' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="240" fixed="right">
        <template #default="{ row }">
          <div class="table-actions">
            <el-button size="small" @click="openForm(row)">编辑</el-button>
            <el-button
              size="small"
              :type="row.status === 1 ? 'warning' : 'success'"
              @click="toggleStatus(row)"
            >
              {{ row.status === 1 ? '下架' : '上架' }}
            </el-button>
            <el-button
              size="small"
              type="primary"
              @click="$router.push(`/dramas/${row.id}/episodes`)"
            >
              集数
            </el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <div style="margin-top: 16px; display: flex; justify-content: flex-end;">
      <el-pagination
        v-model:current-page="page"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next"
        @current-change="fetchList"
        @size-change="fetchList"
      />
    </div>

    <!-- 新增/编辑弹窗 -->
    <el-dialog
      v-model="formVisible"
      :title="editingId ? '编辑剧目' : '新增剧目'"
      width="600px"
      destroy-on-close
    >
      <el-form ref="formRef" :model="form" :rules="formRules" label-width="80px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入剧目标题" />
        </el-form-item>
        <el-form-item label="分类" prop="category">
          <el-input v-model="form.category" placeholder="如：都市、古装、悬疑" />
        </el-form-item>
        <el-form-item label="简介">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="剧目简介" />
        </el-form-item>
        <el-form-item label="封面URL">
          <el-input v-model="form.coverUrl" placeholder="封面图片地址" />
        </el-form-item>
        <el-form-item label="标签">
          <el-input v-model="form.tags" placeholder="多个标签用逗号分隔" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="formVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitForm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { getDramaList, createDrama, updateDrama } from '@/api/drama'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'

const list = ref<any[]>([])
const loading = ref(false)
const searchKeyword = ref('')
const page = ref(1)
const pageSize = ref(20)
const total = ref(0)

const formVisible = ref(false)
const editingId = ref<number | null>(null)
const submitting = ref(false)
const formRef = ref<FormInstance>()

const form = reactive({
  title: '',
  category: '',
  description: '',
  coverUrl: '',
  tags: '',
})

const formRules: FormRules = {
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
}

async function fetchList() {
  loading.value = true
  try {
    const res: any = await getDramaList({
      page: page.value,
      pageSize: pageSize.value,
      keyword: searchKeyword.value || undefined,
    })
    const data = res.data || res
    list.value = data.list || data.dramas || data || []
    total.value = data.total || list.value.length
  } catch {
    list.value = []
  } finally {
    loading.value = false
  }
}

function openForm(row?: any) {
  editingId.value = row?.id || null
  form.title = row?.title || ''
  form.category = row?.category || ''
  form.description = row?.description || ''
  form.coverUrl = row?.coverUrl || ''
  form.tags = row?.tags || ''
  formVisible.value = true
}

async function submitForm() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    if (editingId.value) {
      await updateDrama(editingId.value, { ...form })
      ElMessage.success('更新成功')
    } else {
      await createDrama({ ...form })
      ElMessage.success('创建成功')
    }
    formVisible.value = false
    fetchList()
  } catch {
    // error handled by interceptor
  } finally {
    submitting.value = false
  }
}

async function toggleStatus(row: any) {
  const newStatus = row.status === 1 ? 0 : 1
  const action = newStatus === 1 ? '上架' : '下架'
  try {
    await ElMessageBox.confirm(`确定要${action}「${row.title}」吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await updateDrama(row.id, { status: newStatus })
    ElMessage.success(`${action}成功`)
    fetchList()
  } catch {
    // cancelled or error
  }
}

onMounted(fetchList)
</script>
