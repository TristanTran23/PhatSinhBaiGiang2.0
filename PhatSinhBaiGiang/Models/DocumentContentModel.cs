using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace PhatSinhBaiGiang.Models
{
    public class DocumentContentModel
    {
        public int Id { get; set; }
        public string Stt { get; set; }
        public string Style { get; set; }
        public string Noidung { get; set; }
        public int IdCha { get; set; }
    }
}