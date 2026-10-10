# Source registry for grade-map.json. Every entry was fetched in this session (see fetched_from);
# the official host itself was unreachable from the sandbox (egress policy 403), recorded honestly.
D="2026-10-10"
XML_MIRROR="https://github.com/galacticpolymath/standardX/blob/cbf6666109ffedb564692d796cc447711de4fe0c/data/ela.xml"
XML_NOTE=("Statement text read verbatim from the official CCSSI machine-readable file ela-literacy.xml "
 "(CoreStandardVersion 1.1), which the mirror's own script (scripts/getStandards.R) downloaded from "
 "http://www.corestandards.org/wp-content/uploads/ccssi.zip. Each item carries its official RefURI; the per-grade "
 "url below is that RefURI namespace. corestandards.org / thecorestandards.org were not reachable from this sandbox.")
def ccss(g):
    return {"id":f"ccss-l{g}","title":f"Common Core State Standards, ELA-Literacy, Language, Grade {g} (L.{g}.1-L.{g}.6)",
            "url":f"http://corestandards.org/ELA-Literacy/L/{g}/","fetched":D,
            "fetched_from":XML_MIRROR,"via":"ccss-xml","url_reachable_from_sandbox":False}
SOURCES=[
 {"id":"ccss-xml","title":"Common Core State Standards for English Language Arts & Literacy: official machine-readable XML (ela-literacy.xml, CoreStandardVersion 1.1, from ccssi.zip)",
  "url":"http://www.corestandards.org/wp-content/uploads/ccssi.zip","fetched":D,"fetched_from":XML_MIRROR,
  "sha256":"afaa8619f45a63d60986603ea8ee31f3322d0baf69936bac7523f646840390fb","url_reachable_from_sandbox":False,"note":XML_NOTE},
 *[ccss(g) for g in range(3,9)],
 {"id":"ccss-rf","title":"Common Core State Standards, ELA-Literacy, Reading: Foundational Skills, Grades 3-5 (RF.3.3, RF.4.3, RF.5.3)",
  "url":"http://corestandards.org/ELA-Literacy/RF/3/3/","fetched":D,"fetched_from":XML_MIRROR,"via":"ccss-xml","url_reachable_from_sandbox":False,
  "note":"Outside the requested L.x.2/L.x.4 scope; cited only where it names a concept L.x.2/L.x.4 does not (Latin suffixes, multisyllable words)."},
 {"id":"uk-app1","title":"The national curriculum in England - English Appendix 1: Spelling (Department for Education, September 2013)",
  "url":"https://assets.publishing.service.gov.uk/government/uploads/system/uploads/attachment_data/file/239784/English_Appendix_1_-_Spelling.pdf",
  "publication_page":"https://www.gov.uk/government/publications/national-curriculum-in-england-english-programmes-of-study",
  "fetched":D,"fetched_from":"https://media.githubusercontent.com/media/409357/books/736e42f79542edc1328822260ca693106c211f07/all1/%E8%8B%B1%E8%AF%AD%E8%B5%84%E6%BA%90/English_Appendix_1_-_Spelling.pdf",
  "sha256":"ebc3d8b4336a212f1ace1312e3b80647153835acaa8e8f2a762d86750875cf64","pages":26,"url_reachable_from_sandbox":False,
  "note":("PDF metadata: Title 'The national curriculum in England - English Appendix 1: Spelling', Author/Company 'Department for Education', created 2013-09-10. "
          "The document states: 'the left-hand column is statutory; the middle and right-hand columns are non-statutory guidance' and 'The word-lists for years 3 and 4 and years 5 and 6 are statutory.' "
          "Official asset URL taken from a search-index result, not fetched (gov.uk blocked from sandbox). Year 3-4 section pp.11-17 (word list p.16); Year 5-6 section pp.18-24 (word list p.23).")},
 {"id":"uk-ks12","title":"English programmes of study: key stages 1 and 2 - National curriculum in England (Department for Education; September 2013, July 2014 file)",
  "url":"https://assets.publishing.service.gov.uk/media/5a7de93840f0b62305b7f8ee/PRIMARY_national_curriculum_-_English_220714.pdf",
  "publication_page":"https://www.gov.uk/government/publications/national-curriculum-in-england-english-programmes-of-study",
  "fetched":D,"fetched_from":"https://github.com/silkyrich/uk-curriculum-as-graph/blob/c5452801538a4dfd3dcafbc95fcf2f2714fb8c81/core/data/curriculum-documents/subjects/primary/English_KS1-2_2014.pdf",
  "sha256":"cafa62081e38ab50cca559580ed3afc98743e493cfc80670b41130c848d4017a","pages":88,"url_reachable_from_sandbox":False,
  "note":("PDF metadata: Title 'English programmes of study: key stages 1 and 2', Author 'Department for Education', modified 2014-07-21 (matches the _220714 official filename). "
          "Contains the statutory year-by-year programmes and reproduces Appendix 1. Cited pages: Y3-4 word reading p.25, Y3-4 spelling p.27, Upper KS2 overview p.31, Y5-6 word reading p.33, Y5-6 spelling p.36.")},
 {"id":"uk-ks3","title":"English programmes of study: key stage 3 - National curriculum in England (Department for Education, September 2013)",
  "url":"https://dera.ioe.ac.uk/id/eprint/18287/1/SECONDARY_national_curriculum_-_English.pdf",
  "publication_page":"https://www.gov.uk/government/publications/national-curriculum-in-england-english-programmes-of-study",
  "fetched":D,"fetched_from":"https://github.com/silkyrich/uk-curriculum-as-graph/blob/c5452801538a4dfd3dcafbc95fcf2f2714fb8c81/core/data/curriculum-documents/subjects/secondary/English_KS3_2014.pdf",
  "sha256":"08b0616a3faf6b493dd47b85c05fc46e3bde2ef3a497540c54b55cc20f22d5eb","pages":25,"url_reachable_from_sandbox":False,
  "note":("PDF metadata: Title 'English programmes of study: key stage 3', Author 'Department for Education', 2013-09. Official URL is the DfE archive (DERA) copy found via search index, not fetched. "
          "KS3 subject content pp.4-6: Reading p.4, Writing p.5 (spelling statement), Grammar and vocabulary pp.5-6.")},
 {"id":"cbse-ix","title":"CBSE Secondary School Curriculum 2026-27, Part 1: ENGLISH Class IX (2026-27) - English Language & Literature",
  "url":"https://cbseacademic.nic.in/web_material/CurriculumMain27/SecPart1/English_LL_SecP1IX_2026-27.pdf",
  "fetched":D,"fetched_from":"https://github.com/s13r-io/cbse-notes-creator-v2/blob/e799de206c4f06f0c29b2eaa8c3631a3ee52a520/syllabus/01.English.pdf",
  "sha256":"bc533abf3af07ceae60ad94790f975ac6458b4d86554cb311f37ad3463e9aa18","pages":16,"url_reachable_from_sandbox":False,
  "note":("Byte-identity check: the sha256 and size (851,449 bytes) of the fetched copy equal those an independent project recorded when it fetched the official URL on 2026-08-24 "
          "(github.com/Intellora-ai/final-countdown data/curriculum-sources.lock.json @9027aa9, key 'english-ix'). "
          "The document has no spelling statement. Its only vocabulary statements are on p.6 under 'Structures (Grammar) & Vocabulary'. No CBSE English curriculum for Classes 3-8 was found or fetched.")},
]
