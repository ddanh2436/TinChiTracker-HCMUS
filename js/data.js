/*
 * Dữ liệu chương trình đào tạo — Tăng cường tiếng Anh ngành CNTT, Khóa tuyển 2024
 * (QĐ 2693/QĐ-KHTN ngày 30/09/2024, Trường ĐH Khoa học Tự nhiên, ĐHQG-HCM).
 *
 * Thêm ngành mới: khai báo một object trong PROGRAMS theo cùng cấu trúc với `ktpm`
 * rồi đặt `available: true`. Khối Đại cương + Cơ sở ngành dùng chung cho mọi ngành.
 */
window.TCT_DATA = (() => {
  // ---------- Danh mục học phần: code -> [tên, số TC] ----------
  const RAW = {
    // Lý luận chính trị - Pháp luật
    BAA00101: ['Triết học Mác – Lênin', 3],
    BAA00102: ['Kinh tế chính trị Mác – Lênin', 2],
    BAA00103: ['Chủ nghĩa xã hội khoa học', 2],
    BAA00104: ['Lịch sử Đảng Cộng sản Việt Nam', 2],
    BAA00003: ['Tư tưởng Hồ Chí Minh', 2],
    BAA00004: ['Pháp luật đại cương', 3],
    // KHXH - Kinh tế - Kỹ năng
    BAA00005: ['Kinh tế đại cương', 2],
    BAA00006: ['Tâm lý đại cương', 2],
    BAA00007: ['Phương pháp luận sáng tạo', 2],
    // Toán - KHTN
    MTH00005: ['Vi tích phân 1', 4],
    MTH00006: ['Vi tích phân 2', 4],
    MTH00007: ['Xác suất thống kê', 4],
    MTH00008: ['Đại số tuyến tính', 4],
    MTH00009: ['Toán rời rạc', 4],
    MTH00058: ['Toán học tổ hợp', 4],
    MTH00057: ['Toán ứng dụng và thống kê cho CNTT', 4],
    MTH00059: ['Phương pháp tính', 4],
    MTH00060: ['Lý thuyết số', 4],
    CHE00001: ['Hóa đại cương 1', 3],
    CHE00002: ['Hóa đại cương 2', 3],
    CHE00081: ['Thực hành Hóa đại cương 1', 2],
    CHE00082: ['Thực hành Hóa đại cương 2', 2],
    BIO00001: ['Sinh đại cương 1', 3],
    BIO00002: ['Sinh đại cương 2', 3],
    BIO00081: ['Thực tập Sinh đại cương 1', 1],
    BIO00082: ['Thực tập Sinh đại cương 2', 1],
    PHY00005: ['Vật lý đại cương 1', 4],
    PHY00007: ['Vật lý cho Công nghệ thông tin', 4],
    GEO00002: ['Khoa học Trái đất', 2],
    ENV00001: ['Môi trường đại cương', 2],
    ENV00003: ['Con người và môi trường', 2],
    // Tin học
    CSC00004: ['Nhập môn Công nghệ thông tin', 4],
    // GDTC - GDQP (không tính vào 138 TC)
    BAA00021: ['Thể dục 1', 2],
    BAA00022: ['Thể dục 2', 2],
    BAA00030: ['Giáo dục quốc phòng – An ninh', 4],

    // Cơ sở ngành
    CSC10012: ['Cơ sở lập trình', 4],
    CSC10003: ['Phương pháp lập trình hướng đối tượng', 4],
    CSC10004: ['Cấu trúc dữ liệu và giải thuật', 4],
    CSC10014: ['Tư duy tính toán', 4],
    CSC10006: ['Cơ sở dữ liệu', 4],
    CSC10007: ['Hệ điều hành', 4],
    CSC10008: ['Mạng máy tính', 4],
    CSC10009: ['Hệ thống máy tính', 2],
    CSC13002: ['Nhập môn công nghệ phần mềm', 4],
    CSC14003: ['Cơ sở trí tuệ nhân tạo', 4],

    // Học phần chuyên ngành (tất cả các ngành)
    CSC00008: ['Lý thuyết đồ thị', 4],
    CSC10102: ['Kiến tập nghề nghiệp', 2],
    CSC10103: ['Khởi nghiệp', 3],
    CSC10104: ['Quy hoạch tuyến tính', 4],
    CSC10105: ['Nhập môn tư duy thuật toán', 4],
    CSC10106: ['Thuật toán tổ hợp và ứng dụng', 4],
    CSC10107: ['Thực tập thực tế', 4],
    CSC10108: ['Trực quan hóa dữ liệu', 4],
    CSC10121: ['Kỹ năng mềm', 3],
    CSC11002: ['Hệ thống viễn thông', 4],
    CSC11003: ['Lập trình mạng', 4],
    CSC11004: ['Mạng máy tính nâng cao', 4],
    CSC11006: ['Nhập môn điện toán đám mây', 4],
    CSC11007: ['Nhập môn DevOps', 4],
    CSC11106: ['Truyền thông không dây', 4],
    CSC11114: ['Ứng dụng dịch vụ điện toán đám mây cho doanh nghiệp', 4],
    CSC11115: ['An ninh mạng', 4],
    CSC11116: ['DevOps nâng cao', 4],
    CSC11117: ['Hệ điều hành Linux và ứng dụng', 4],
    CSC11118: ['Triển khai và vận hành điện toán đám mây', 4],
    CSC11120: ['Bảo mật web và thiết bị di động', 4],
    CSC12001: ['An toàn và bảo mật dữ liệu trong hệ thống thông tin', 4],
    CSC12002: ['Cơ sở dữ liệu nâng cao', 4],
    CSC12003: ['Hệ quản trị cơ sở dữ liệu', 4],
    CSC12004: ['Phân tích thiết kế hệ thống thông tin', 4],
    CSC12005: ['Phát triển ứng dụng hệ thống thông tin hiện đại', 4],
    CSC12102: ['Chuyên đề chọn lọc trong Hệ thống thông tin', 4],
    CSC12103: ['Chuyên đề Hệ quản trị cơ sở dữ liệu nâng cao', 4],
    CSC12105: ['Thương mại điện tử', 4],
    CSC12106: ['Tương tác người – máy', 4],
    CSC12109: ['Hệ thống thông tin doanh nghiệp', 4],
    CSC12110: ['Phân tích dữ liệu ứng dụng', 4],
    CSC12112: ['Môi trường và công cụ cho tiếp thị số', 4],
    CSC12113: ['Nhập môn quản trị mối quan hệ khách hàng – sản phẩm', 4],
    CSC13001: ['Lập trình Windows', 4],
    CSC13003: ['Kiểm thử phần mềm', 4],
    CSC13005: ['Phân tích và quản lý yêu cầu phần mềm', 4],
    CSC13006: ['Quản lý dự án phần mềm', 4],
    CSC13007: ['Phát triển game', 4],
    CSC13008: ['Phát triển ứng dụng web', 4],
    CSC13009: ['Phát triển phần mềm cho thiết bị di động', 4],
    CSC13010: ['Thiết kế phần mềm', 4],
    CSC13101: ['Các chủ đề nâng cao trong Công nghệ phần mềm', 4],
    CSC13102: ['Lập trình ứng dụng Java', 4],
    CSC13103: ['Nhập môn hệ thống phân tán', 4],
    CSC13106: ['Kiến trúc phần mềm', 4],
    CSC13107: ['Mẫu thiết kế hướng đối tượng và ứng dụng', 4],
    CSC13112: ['Thiết kế giao diện', 4],
    CSC13117: ['Phát triển game nâng cao', 4],
    CSC13119: ['Lập trình Web 1', 4],
    CSC13120: ['Lập trình Web 2', 4],
    CSC13121: ['Lập trình ứng dụng quản lý 1', 4],
    CSC13122: ['Lập trình ứng dụng quản lý 2', 4],
    CSC14001: ['Automata và ngôn ngữ hình thức', 4],
    CSC14002: ['Các hệ cơ sở tri thức', 4],
    CSC14004: ['Khai thác dữ liệu và ứng dụng', 4],
    CSC14005: ['Nhập môn học máy', 4],
    CSC14006: ['Nhận dạng', 4],
    CSC14007: ['Nhập môn phân tích độ phức tạp thuật toán', 4],
    CSC14008: ['Phương pháp nghiên cứu khoa học', 4],
    CSC14101: ['Ẩn dữ liệu và chia sẻ thông tin', 4],
    CSC14105: ['Khoa học về web', 4],
    CSC14111: ['Nhập môn thiết kế và phân tích giải thuật', 4],
    CSC14112: ['Sinh trắc học', 4],
    CSC14113: ['Trình biên dịch', 4],
    CSC14117: ['Nhập môn lập trình kết nối vạn vật', 4],
    CSC14118: ['Nhập môn dữ liệu lớn', 4],
    CSC14119: ['Nhập môn khoa học dữ liệu', 4],
    CSC14120: ['Lập trình song song', 4],
    CSC15001: ['An ninh máy tính', 4],
    CSC15002: ['Bảo mật cơ sở dữ liệu', 4],
    CSC15003: ['Mã hóa ứng dụng', 4],
    CSC15004: ['Học thống kê', 4],
    CSC15005: ['Nhập môn mã hóa – mật mã', 4],
    CSC15006: ['Nhập môn xử lý ngôn ngữ tự nhiên', 4],
    CSC15007: ['Thống kê máy tính và ứng dụng', 4],
    CSC15009: ['Xử lý tín hiệu số', 4],
    CSC15010: ['Blockchain và ứng dụng', 4],
    CSC15011: ['Nhập môn ngôn ngữ học thống kê và ứng dụng', 4],
    CSC15012: ['Ứng dụng xử lý ngôn ngữ tự nhiên trong doanh nghiệp', 4],
    CSC15102: ['Phân tích mạng xã hội', 4],
    CSC15107: ['Phân tích dữ liệu bảo toàn tính riêng tư', 4],
    CSC15108: ['Pháp chứng cho dữ liệu số', 4],
    CSC15109: ['Nhập môn tính toán lượng tử', 4],
    CSC16001: ['Đồ họa máy tính', 4],
    CSC16002: ['Phương pháp toán trong phân tích dữ liệu thị giác', 4],
    CSC16003: ['Phân tích thống kê dữ liệu nhiều biến', 4],
    CSC16004: ['Thị giác máy tính', 4],
    CSC16005: ['Xử lý ảnh số và video số', 4],
    CSC16101: ['Đồ họa ứng dụng', 4],
    CSC16102: ['Kỹ thuật lập trình xử lý ảnh số và video số', 4],
    CSC16105: ['Truy vấn thông tin thị giác', 4],
    CSC16106: ['Nhập môn lập trình điều khiển thiết bị thông minh', 4],
    CSC16107: ['Ứng dụng thị giác máy tính', 4],
    CSC16109: ['Ứng dụng xử lý ảnh số và video số', 4],
    CSC16113: ['Thị giác máy tính ba chiều', 4],
    CSC16114: ['Học sâu trong thị giác máy tính', 4],
    CSC17001: ['Phân tích dữ liệu thông minh', 4],
    CSC17101: ['Hệ thống tư vấn', 4],
    CSC17102: ['Học sâu cho khoa học dữ liệu', 4],
    CSC17103: ['Khai thác dữ liệu đồ thị', 4],
    CSC17104: ['Lập trình cho khoa học dữ liệu', 4],
    CSC17106: ['Xử lý phân tích dữ liệu trực tuyến', 4],
    CSC18001: ['Nhập môn học sâu', 4],
    CSC18101: ['Trí tuệ nhân tạo cho an ninh thông tin', 4],
    CSC18102: ['Phương pháp toán cho tối ưu', 4],
    CSC18103: ['Trí tuệ bầy đàn', 4],
    CSC18104: ['Nhập môn hệ thống đa tác nhân', 4],

    // Kiến thức tốt nghiệp (tất cả các ngành)
    CSC10251: ['Khóa luận tốt nghiệp', 10],
    CSC10252: ['Thực tập tốt nghiệp', 10],
    CSC10204: ['Thực tập dự án tốt nghiệp', 6],
    CSC10202: ['Chuyên đề Tổ chức dữ liệu', 6],
    CSC10203: ['Chuyên đề Thiết kế phần mềm nâng cao', 6],
    CSC11111: ['Chuyên đề tốt nghiệp Mạng máy tính', 4],
    CSC11112: ['Chuyên đề Hệ thống phân tán', 4],
    CSC11119: ['Chuyên đề phân tích mạng', 4],
    CSC12107: ['Hệ thống thông tin phục vụ trí tuệ kinh doanh', 4],
    CSC12108: ['Ứng dụng phân tán', 4],
    CSC12111: ['Quản trị cơ sở dữ liệu hiện đại', 4],
    CSC13114: ['Phát triển ứng dụng web nâng cao', 4],
    CSC13115: ['Các công nghệ mới trong phát triển phần mềm', 4],
    CSC13116: ['Đồ án Công nghệ phần mềm', 4],
    CSC13118: ['Phát triển ứng dụng cho thiết bị di động nâng cao', 4],
    CSC13123: ['Đồ án Phần mềm', 6],
    CSC14114: ['Ứng dụng dữ liệu lớn', 4],
    CSC14115: ['Khoa học dữ liệu ứng dụng', 4],
    CSC14116: ['Lập trình song song ứng dụng', 4],
    CSC15104: ['An toàn và phục hồi dữ liệu', 4],
    CSC15105: ['Khai thác dữ liệu văn bản và ứng dụng', 4],
    CSC15106: ['Seminar Công nghệ tri thức', 4],
    CSC15201: ['Đồ án Mã hóa ứng dụng và an ninh thông tin', 6],
    CSC15202: ['Đồ án tốt nghiệp hướng ứng dụng xử lý ngôn ngữ tự nhiên', 6],
    CSC16110: ['Chuyên đề Đồ họa máy tính', 4],
    CSC16111: ['Chuyên đề Thị giác máy tính', 4],
    CSC16112: ['Chuyên đề Xử lý ảnh số và video số', 4],
    CSC17107: ['Ứng dụng phân tích dữ liệu thông minh', 4],
    CSC18105: ['Trí tuệ nhân tạo ứng dụng', 4],
  };

  const COURSES = {};
  for (const [code, [name, tc]] of Object.entries(RAW)) COURSES[code] = { code, name, tc };

  // ---------- Khối kiến thức Giáo dục đại cương (56 TC, dùng chung) ----------
  const GENERAL = {
    id: 'general',
    title: 'Giáo dục đại cương',
    credits: 56,
    groups: [
      {
        id: 'llct', title: 'Lý luận chính trị – Pháp luật', rule: { kind: 'all' },
        courses: ['BAA00101', 'BAA00102', 'BAA00103', 'BAA00104', 'BAA00003', 'BAA00004'],
      },
      {
        id: 'khxh', title: 'Khoa học xã hội – Kinh tế – Kỹ năng', rule: { kind: 'credits', credits: 2, label: 'Chọn 1 học phần' },
        courses: ['BAA00005', 'BAA00006', 'BAA00007'],
      },
      {
        id: 'toan', title: 'Toán bắt buộc', rule: { kind: 'all' },
        courses: ['MTH00005', 'MTH00006', 'MTH00007', 'MTH00008', 'MTH00009', 'MTH00058'],
      },
      {
        id: 'toan-tc', title: 'Toán tự chọn', rule: { kind: 'credits', credits: 4, label: 'Chọn 1 học phần' },
        courses: ['MTH00057', 'MTH00059', 'MTH00060'],
      },
      {
        id: 'khtn', title: 'Khoa học tự nhiên – Môi trường', rule: { kind: 'credits', credits: 8, label: 'Chọn ≥ 8 TC' },
        courses: ['PHY00005', 'PHY00007', 'CHE00001', 'CHE00002', 'CHE00081', 'CHE00082', 'BIO00001', 'BIO00002',
          'BIO00081', 'BIO00082', 'GEO00002', 'ENV00001', 'ENV00003'],
      },
      {
        id: 'tinhoc', title: 'Tin học', rule: { kind: 'all' },
        courses: ['CSC00004'],
      },
    ],
  };

  // Điều kiện tốt nghiệp không tính vào 138 TC
  const CONDITIONS = {
    id: 'conditions',
    title: 'Giáo dục thể chất & Quốc phòng',
    note: 'Không tính vào 138 TC và điểm trung bình, nhưng bắt buộc để tốt nghiệp.',
    courses: ['BAA00021', 'BAA00022', 'BAA00030'],
  };

  // ---------- Khối Cơ sở ngành (38 TC, dùng chung) ----------
  const FOUNDATION = {
    id: 'foundation',
    title: 'Cơ sở ngành',
    credits: 38,
    groups: [
      {
        id: 'csn', title: 'Kiến thức cơ sở ngành', rule: { kind: 'all' },
        courses: ['CSC10012', 'CSC10003', 'CSC10004', 'CSC10014', 'CSC10006', 'CSC10007', 'CSC10008',
          'CSC10009', 'CSC13002', 'CSC14003'],
      },
    ],
  };

  // Kế hoạch giảng dạy dự kiến HK1–HK6 (mục 8.1, dùng chung)
  const COMMON_PLAN = {
    CSC00004: 1, CSC10012: 1, MTH00009: 1, CSC10121: 1,
    CSC10004: 2, MTH00058: 2, PHY00005: 2, BAA00004: 2,
    CSC10003: 3, CSC10009: 3, MTH00005: 3, MTH00008: 3,
    CSC10014: 4, CSC10008: 4, MTH00006: 4, BAA00005: 4, BAA00021: 4, BAA00030: 4,
    CSC10006: 5, CSC10007: 5, MTH00007: 5, BAA00022: 5,
    PHY00007: 6, CSC14003: 6, MTH00057: 6, BAA00003: 6,
  };

  // Mọi học phần chuyên ngành + tốt nghiệp của tất cả các ngành — nguồn cho "tự chọn tự do".
  const ALL_MAJOR_COURSES = Object.keys(COURSES).filter(
    (c) => c.startsWith('CSC') && !FOUNDATION.groups[0].courses.includes(c) && c !== 'CSC00004'
  );

  // ---------- Ngành ----------
  const ktpmCore = ['CSC13003', 'CSC13005', 'CSC13006', 'CSC13007', 'CSC13008', 'CSC13009', 'CSC13010', 'CSC13106', 'CSC13112'];
  const ktpmElective = ['CSC10121', 'CSC10102', 'CSC10103', 'CSC10105', 'CSC10107', 'CSC13001', 'CSC13101', 'CSC13102',
    'CSC13103', 'CSC13107', 'CSC13117', 'CSC11007', 'CSC14005', 'CSC16106'];
  const ktpmGradExtra = ['CSC13114', 'CSC13115', 'CSC13116', 'CSC13118'];
  const ktpmGrad = ['CSC10251', 'CSC10252', 'CSC10204', ...ktpmGradExtra];

  const PROGRAMS = {
    mmt: { name: 'Mạng máy tính và Viễn thông', available: false },
    httt: { name: 'Hệ thống thông tin', available: false },
    ktpm: {
      name: 'Kỹ thuật phần mềm',
      available: true,
      major: {
        title: 'Chuyên ngành',
        credits: 34,
        core: {
          title: 'Bắt buộc chuyên ngành', minCourses: 4, minCredits: 16,
          courses: ktpmCore,
        },
        elective: {
          title: 'Tự chọn chuyên ngành', minCourses: 2, minCredits: 8,
          hint: 'Môn bắt buộc chuyên ngành học dư cũng được tính vào đây.',
          courses: ktpmElective,
        },
        free: {
          title: 'Tự chọn tự do',
          hint: 'Chọn từ học phần chuyên ngành / tốt nghiệp của các ngành khác. Phần dư của các nhóm trên cũng được tính vào đây.',
          courses: ALL_MAJOR_COURSES.filter((c) => ![...ktpmCore, ...ktpmElective, ...ktpmGrad].includes(c)),
        },
      },
      graduation: {
        title: 'Tốt nghiệp',
        credits: 10,
        options: [
          { id: 'kltn', title: 'Phương án 1 · Khóa luận tốt nghiệp', parts: [{ credits: 10, courses: ['CSC10251'] }] },
          { id: 'tttn', title: 'Phương án 2 · Thực tập tốt nghiệp', parts: [{ credits: 10, courses: ['CSC10252'] }] },
          {
            id: 'ttda', title: 'Phương án 3 · Thực tập dự án + 1 học phần tốt nghiệp',
            parts: [
              { credits: 6, courses: ['CSC10204'] },
              { credits: 4, label: 'Chọn 1 học phần (4 TC)', courses: ktpmGradExtra },
            ],
          },
        ],
      },
      // Kế hoạch giảng dạy dự kiến HK7–HK12 (mục 8.2.3)
      plan: {
        CSC13002: 7, CSC13008: 7, CSC13102: 7, BAA00101: 7,
        CSC13005: 8, CSC13009: 8, CSC13001: 8, CSC13010: 8, BAA00102: 8,
        CSC10103: 9, CSC10107: 9, CSC13003: 9, CSC13006: 9, CSC13106: 9, CSC13112: 9,
        CSC10204: 10, CSC10251: 10, CSC10252: 10, CSC13114: 10, CSC13007: 10, CSC13103: 10, CSC13107: 10, BAA00103: 10,
        CSC13116: 11, CSC13118: 11, CSC13101: 11, BAA00104: 11,
        CSC13115: 12,
      },
    },
    khmt: { name: 'Khoa học máy tính', available: false },
    cntt_tt: { name: 'Công nghệ tri thức', available: false },
    tgmt: { name: 'Thị giác máy tính', available: false },
    attt: { name: 'An toàn thông tin', available: false },
    khdl: { name: 'Khoa học dữ liệu', available: false },
    cntt: { name: 'Công nghệ thông tin', available: false },
  };

  return {
    PROGRAM_INFO: 'Chương trình Tăng cường tiếng Anh · Ngành CNTT · Khóa 2024',
    TOTAL_CREDITS: 138,
    COURSES, GENERAL, FOUNDATION, CONDITIONS, COMMON_PLAN, PROGRAMS,
  };
})();
