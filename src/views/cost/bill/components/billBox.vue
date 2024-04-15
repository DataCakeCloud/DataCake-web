<template>
  <div class="r-l">
    <div class="r-head">
      <span>{{ billType === 1 ? '平台账单' : '云商账单' }}</span>
      <el-select v-model="queryMonth" style="width: 20%" @change="getBillList">
        <el-option v-for="item in monthList" :key="item" :label="item" :value="item"> </el-option>
      </el-select>
      <el-select v-model="tenantName" clearable placeholder="所有租户" style="width: 20%" @change="getBillList">
        <template v-for="(item, index) in tenantList">
          <el-option :key="index" :label="item.name" :value="item.value"></el-option>
        </template>
      </el-select>
      <el-select v-if="isCloud" v-model="pus" placeholder="业务线" filterable clearable multiple style="width: 20%" @change="getBillList">
        <el-option v-for="item in businessList" :key="item.id" :value="item.id" :label="item.name"></el-option>
      </el-select>

      <el-button :loading="pdfLoading" :disabled="pdfLoading" icon="el-icon-download" @click="handleExportPdf">导出 pdf</el-button>
    </div>

    <Bill ref="refBill" :bill-data="billData" :loading="loading" @updateActive="updateActive"></Bill>
    <vue-html2pdf
      ref="html2Pdf"
      :show-layout="false"
      :float-layout="true"
      :enable-download="true"
      :preview-modal="true"
      :paginate-elements-by-height="1400"
      :filename="billType === 1 ? '客户账单' : 'DC账单'"
      :pdf-quality="2"
      :manual-pagination="true"
      pdf-format="a4"
      :pdf-margin="20"
      pdf-orientation="portrait"
      pdf-content-width="800px"
      @beforeDownload="beforeDownload($event)"
      @hasDownloaded="hasDownloaded($event)"
    >
      <section slot="pdf-content">
        <!-- PDF Content Here -->

        <Bill :bill-data="billData" :actives="actives"></Bill>
      </section>
    </vue-html2pdf>
  </div>
</template>

<script>
import { getYearMonthArray } from '@/utils/';
import { homeRequest, costListDictionary } from '@/api/cost';
import VueHtml2pdf from 'vue-html2pdf';
import Bill from './bill';
import { mapGetters } from 'vuex';
export default {
  name: 'BillBox',
  components: {
    VueHtml2pdf,
    Bill
  },
  props: {
    billType: [Number]
  },
  data() {
    const d = new Date();
    d.setDate(1);
    let m = d.getMonth() + 1;
    m = m < 10 ? '0' + m : m;
    return {
      queryMonth: new Date().getFullYear() + '-' + m,
      tenantName: '',
      pus: [],
      loading: false,
      pdfLoading: false,
      monthList: getYearMonthArray(),
      defaultTenantlist: [],
      businessList: [],
      billData: {
        title: [],
        body: []
      },
      actives: [0]
    };
  },
  computed: {
    ...mapGetters(['userInfo', 'isCloud']),
    tenantList() {
      if (this.billType === 1) return this.defaultTenantlist;
      if (this.billType === 2) {
        let list = this.$t('cost.lesseeList');
        list = list.concat(this.defaultTenantlist);
        return list;
      }
      return [];
    }
  },
  created() {
    this.getTenantList();
    this.getBusinessList();
  },
  methods: {
    getTenantList() {
      const params = {
        requestType: 2,
        name: ''
      };
      costListDictionary(params).then(res => {
        this.defaultTenantlist = res.data;
        if (this.billType === 1) this.tenantName = res.data[0].name;

        this.getBillList();
      });
    },
    getBusinessList() {
      const params = {
        requestType: 15,
        name: ''
      };
      costListDictionary(params).then(res => {
        this.treeLoading = false;
        this.businessList = res.data;
      });
    },
    getBillList() {
      this.loading = true;
      const params = {
        reportType: 7,
        queryMonth: this.queryMonth,
        roleView: this.billType === 1 ? 1 : 0,
        tenantName: this.tenantName,
        pus: this.pus
      };
      homeRequest(params).then(res => {
        this.loading = false;
        const data = res.data;
        const body = data.body.map(e => {
          const item = {
            ...e,
            activeName: []
          };

          return item;
        });

        body[0].activeName = [0];
        data.body = body;
        this.billData = data;
      });
    },
    handleExportPdf() {
      this.$refs.html2Pdf.generatePdf();
    },
    beforeDownload() {
      this.pdfLoading = true;
    },
    hasDownloaded() {
      this.pdfLoading = false;
    },
    updateActive(val) {
      this.actives = val;
    }
  }
};
</script>

<style lang="scss" rel="stylesheet/sass" scoped>
::v-deep .el-divider {
  margin: 0;
}

.r-l {
  flex: 1;
  margin-right: 10px;
}
</style>
