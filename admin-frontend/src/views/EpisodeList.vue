<template>
  <div>
    <div class="page-header">
      <div style="display: flex; align-items: center; gap: 12px;">
        <el-button text @click="$router.push('/dramas')">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <h2>{{ dramaTitle }} - 剧集管理</h2>
      </div>
      <el-button type="primary" @click="openForm()">
        <el-icon><Plus /></el-icon>
        新增剧集
      </el-button>
    </div>

    <el-table :data="list" v-loading="loading" border stripe>
      <el-table-column prop="episodeNumber" label="集数" width="80" align="center" />
      <el-table-column prop="title" label="标题" min-width="180" show-overflow-tooltip />
      <el-table-column prop="duration" label="时长" width="100" align="center">
        <template #default="{ row }">
          {{ formatDuration(row.duration) }}
        </template>
      </el-table-column>
      <el-table-column label="免费" width="80" align="center">
        <template #default="{ row }">
          <el-tag :type="row.isFree ? 'success' : 'warning'" size="small">
            {{ row.isFree ? '免费' : '付费' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="price" label="价格(金币)" width="110" align="center">
        <template #default="{ row }">
          {{ row.isFree ? '-' : (row.price ?? 0) }}
        </template>
      </el-table-column>
      <el-table-column prop="playCount" label="播放量" width="100" align="center" />
      <el-table-column label="状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
            {{ row.status === 1 ? '正常' : '下架' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="120" fixed="right">
        <template #default="{ row }">
          <el-button size="small" @click="openForm(row)">编辑</el-button>
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
      :title="editingId ? '编辑剧集' : '新增剧集'"
      width="550px"
      destroy-on-close
    >
      <el-form ref="formRef" :model="form" :rules="formRules" label-width="100px">
        <el-form-item label="集数" prop="episodeNumber">
          <el-input-number v-model="form.episodeNumber" :min="1" />
        </el-form-item>
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" placeholder="剧集标题" />
        </el-form-item>
        <el-form-item label="视频URL">
          <el-input v-model="form.videoUrl" placeholder="视频播放地址" />
        </el-form-item>
        <el-form-item label="时长(秒)">
          <el-input-number v-model="form.duration" :min="0" />
        </el-form-item>
        <el-form-item label="是否免费">
          <el-switch v-model="form.isFree" />
        </el-form-item>
        <el-form-item label="价格(金币)" v-if="!form.isFree">
          <el-input-number v-model="form.price" :min="0" />
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
import { useRoute } from 'vue-router'
import { getEpisodeList, getEpisodeDetail, createEpisode, updateEpisode, getDramaDetail } from '@/api/drama'
import { ElMessage } from 'element-plus'
import { Plus, ArrowLeft } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'

const route = useRoute()
const dramaId = route.params.id as string
const dramaTitle = ref('')

const list = ref<any[]>([])
const loading = ref(false)
const page = ref(1)
const pageSize = ref(20)
const total = ref(0)

const formVisible = ref(false)
const editingId = ref<number | null>(null)
const submitting = ref(false)
const formRef = ref<FormInstance>()

const form = reactive({
  episodeNumber: 1,
  title: '',
  videoUrl: '',
  duration: 0,
  isFree: false,
  price: 0,
})

const formRules: FormRules = {
  episodeNumber: [{ required: true, message: '请输入集数', trigger: 'blur' }],
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
}

function formatDuration(seconds?: number) {
  if (!seconds) return '-'
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

async function fetchDramaTitle() {
  try {
    const res: any = await getDramaDetail(dramaId)
    dramaTitle.value = res.data?.title || res.title || `剧目 #${dramaId}`
  } catch {
    dramaTitle.value = `剧目 #${dramaId}`
  }
}

async function fetchList() {
  loading.value = true
  try {
    const res: any = await getEpisodeList(dramaId, {
      page: page.value,
      pageSize: pageSize.value,
    })
    const data = res.data || res
    list.value = data.list || data.episodes || data || []
    total.value = data.total || list.value.length
  } catch {
    list.value = []
  } finally {
    loading.value = false
  }
}

function openForm(row?: any) {
  editingId.value = row?.id || null
  form.episodeNumber = row?.episodeNumber || (list.value.length + 1)
  form.title = row?.title || ''
  form.videoUrl = row?.videoUrl || ''
  form.duration = row?.duration || 0
  form.isFree = row?.isFree ?? false
  form.price = row?.price || 0
  formVisible.value = true
}

async function submitForm() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    const payload = { ...form, dramaId: Number(dramaId) }
    if (editingId.value) {
      await updateEpisode(editingId.value, payload)
      ElMessage.success('更新成功')
    } else {
      await createEpisode(payload)
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

onMounted(() => {
  fetchDramaTitle()
  fetchList()
})
</script>
