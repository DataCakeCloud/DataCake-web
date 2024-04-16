<template>
  <el-dialog title="定时任务配置" :visible.sync="dialogVisible" width="650px" class="controlDial" @close="close">
    <el-form ref="taskFrom" :model="taskFrom" :rules="rules" label-width="100px">
      <el-form-item label="任务名称: " prop="taskName">
        <el-input v-model="taskFrom.taskName"></el-input>
      </el-form-item>
      <el-form-item label="调度周期: " prop="schedule">
        <el-select v-model="taskFrom.schedule" class="cron-input" clearable>
          <el-option v-for="item in cycleList" :key="item.value" :label="item.label" :value="item.value"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="邮箱提醒: ">
        <el-radio-group v-model="hasEmial" @change="change($event, 'email')">
          <el-radio :label="0">否</el-radio>
          <el-radio :label="1">是</el-radio>
        </el-radio-group>
        <el-select
          v-if="hasEmial === 1"
          v-model="taskFrom.email"
          class="emial_input"
          placeholder="请输入邮箱"
          clearable
          filterable
          allow-create
          default-first-option
          remote
:remote-method="remoteMethod"
          :loading="ownerLoading"
          popper-class="custom-popper"
        >
          <el-option v-for="item in ownerList" :key="item.shareId" :value="item.email" :label="item.email"> </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="开始时间: ">
        <el-radio-group v-model="startTimeType" @change="change($event, 'startTime')">
          <el-radio :label="0">现在开始</el-radio>
          <el-radio :label="1">设定开始时间</el-radio>
        </el-radio-group>
        <el-date-picker v-if="startTimeType === 1" v-model="taskFrom.startTime" class="time_picker" :picker-options="pickerOptions" type="datetime" value-format="yyyy-MM-dd HH:mm:ss" placeholder="选择日期时间"> </el-date-picker>
      </el-form-item>
      <el-form-item label="结束时间: ">
        <el-radio-group v-model="endTimeType" @change="change($event, 'endTime')">
          <el-radio :label="0">永不结束</el-radio>
          <el-radio :label="1">设定结束时间</el-radio>
        </el-radio-group>
        <el-date-picker v-if="endTimeType === 1" v-model="taskFrom.endTime" class="time_picker" :picker-options="pickerOptions2" type="datetime" value-format="yyyy-MM-dd HH:mm:ss" placeholder="选择日期时间"> </el-date-picker>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="dialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="submit">确 定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { getUserList } from '@/api/task';
function resetFrom() {
  return {
    taskName: '',
    schedule: '',
    email: '',
    startTime: '',
    endTime: ''
  };
}
export default {
  name: 'ControlDoal',
  data() {
    return {
      hasEmial: 0,
      endTimeType: 0,
      startTimeType: 0,
      dialogVisible: false,
      taskFrom: resetFrom(),
      rules: {
        taskName: [{ required: true, message: '请输入任务名称', trigger: 'blur' }],
        schedule: [{ required: true, message: '请选择调度周期', trigger: 'change' }]
      },
      cycleList: [
        { label: '分钟', value: 'minutely' },
        { label: '小时', value: 'hourly' },
        { label: '天', value: 'daily' },
        { label: '周', value: 'weekly' },
        { label: '月', value: 'monthly' }
      ],
      pickerOptions: {
        disabledDate(time) {
          return time.getTime() + 24 * 60 * 60 * 1000 < Date.now();
        }
      },
      pickerOptions2: {
        disabledDate(time) {
          return time.getTime() + 24 * 60 * 60 * 1000 < Date.now();
        }
      },
      ownerList: [],
      ownerLoading: false
    };
  },
  watch: {
    'taskFrom.startTime'(value) {
      if (value) {
        this.pickerOptions2 = {
          disabledDate(time) {
            return time.getTime() < new Date(value).getTime();
          }
        };
      }
    }
  },
  methods: {
    remoteMethod(query) {
      if (query !== '') {
        this.ownerLoading = true;
        getUserList(query)
          .then(res => {
            const data = res.data || [];
            this.ownerList = data;
          })
          .finally(() => {
            this.ownerLoading = false;
          });
      } else {
        this.ownerList = [];
      }
    },
    change(val, key) {
      if (!val) {
        this.taskFrom[key] = '';
      }
    },
    callback() {
      this.dialogVisible = false;
    },
    submit() {
      this.$refs.taskFrom.validate(valid => {
        if (valid) {
          this.$emit('submit', this.taskFrom, this.callback);
        }
      });
    },
    close() {
      this.hasEmially = 0;
      this.startTimeType = 0;
      this.endTimeType = 0;
      this.$refs.taskFrom.resetFields();
    },
    show() {
      this.dialogVisible = true;
    }
  }
};
</script>

<style lang="scss" scoped>
.controlDial {
  .time_picker {
    margin-left: 20px;
  }
  .emial_input {
    width: 100%;
    margin-top: 10px;
  }
}
</style>
