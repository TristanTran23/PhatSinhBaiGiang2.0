using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Wordprocessing;
using PhatSinhBaiGiang.Models;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Newtonsoft.Json;

namespace PhatSinhBaiGiang.Controllers
{
    public class PhatSinhBaiGiangGPTController : Controller
    {
        // GET: PhatSinhBaiGiang
        public ActionResult Index()
        {
            return View();
        }
        [HttpPost]
        public ActionResult Index(HttpPostedFileBase fileUpload)
        {
            try
            {
                var dsNoidung = new List<DocumentContentModel>();
                if (fileUpload.ContentLength > 0)
                {
                    string _FileName = Path.GetFileName(fileUpload.FileName);
                    string _path = Path.Combine(Server.MapPath("~/UploadedFiles"), _FileName);
                    fileUpload.SaveAs(_path);
                    dsNoidung = ReadWordContent(_path);
                }
                ViewBag.Message = "File Uploaded Successfully!!";
                return View(dsNoidung);
            }
            catch
            {
                ViewBag.Message = "File upload failed!!";
                return View(new List<DocumentContentModel>());
            }
        }

        public ActionResult GPTProcess(string noidungchon)
        {
            if (string.IsNullOrEmpty(noidungchon))
                return RedirectToAction("Index");

            var dsNoiDung = JsonConvert.DeserializeObject<List<DocumentContentModel>>(noidungchon);
            return View(dsNoiDung);
        }

        private List<DocumentContentModel> ReadWordContent(string filepath)
        {
            var dsNoidung = new List<DocumentContentModel>();
            // Open a WordprocessingDocument based on a filepath.
            using (WordprocessingDocument wordDocument =
                WordprocessingDocument.Open(filepath, false))
            {
                // Assign a reference to the existing document body.  
                Body body = wordDocument.MainDocumentPart.Document.Body;
                var paras = body.OfType<Paragraph>()
                    .Where(p => p.ParagraphProperties != null && p.ParagraphProperties.ParagraphStyleId != null && 
                    (p.ParagraphProperties.ParagraphStyleId.Val.Value.Contains("Head3") || 
                    p.ParagraphProperties.ParagraphStyleId.Val.Value.Contains("Head4") ||
                    p.ParagraphProperties.ParagraphStyleId.Val.Value.Contains("Head5"))).ToList();

                int id = 0;
                int idCha = 0;
                string style_truoc = "";
                int id_head3 = 0, id_head4 = 0;
                int stt_head4 = 0, stt_head5 = 0;
                foreach (var para in paras)
                {
                    if (style_truoc == "")
                        style_truoc = para.ParagraphProperties.ParagraphStyleId.Val.Value;
                    id++;
                    if (para.ParagraphProperties.ParagraphStyleId.Val.Value == "Head3")
                    {
                        idCha = 0;
                        id_head3 = id;
                        stt_head4 = 0;
                        stt_head5 = 0;
                    }
                    else if (para.ParagraphProperties.ParagraphStyleId.Val.Value == "Head4")
                    {

                        idCha = id_head3;
                        id_head4 = id;
                        stt_head4++;
                        stt_head5 = 0;
                    }
                    else // "Head5"
                    {
                        idCha = id_head4;
                        stt_head5++;
                    }

                    var nd = new DocumentContentModel
                    {
                        Id = id,
                        Stt = "",
                        Style = para.ParagraphProperties.ParagraphStyleId.Val.Value,
                        Noidung = para.InnerText.Replace("\"", "&quot;"),
                        IdCha = idCha
                    };
                    if (nd.Style != "Head3")
                        nd.Stt = stt_head5 > 0 ? $"{stt_head4}.{stt_head5}" : $"{stt_head4}";
                    dsNoidung.Add(nd);
                }
            }
            return dsNoidung;
        }
    }
}