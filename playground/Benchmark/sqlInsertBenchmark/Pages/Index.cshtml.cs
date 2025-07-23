using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using sqlInsertBenchmark.Model;
using System;
using System.Diagnostics;
using System.Text.Json;

namespace sqlInsertBenchmark.Pages
{
    public class IndexModel : PageModel
    {
        private readonly ILogger<IndexModel> _logger;
        private readonly BenchmarkDBContext _context;

        public IndexModel(ILogger<IndexModel> logger, BenchmarkDBContext context)
        {
            _logger = logger;
            _context = context;
        }

        public async Task<ActionResult> OnGet()
        {
            Stopwatch stopwatch = Stopwatch.StartNew();
            
            long count = 0;
            while (stopwatch.Elapsed < TimeSpan.FromSeconds(10))
            {
                for (int i = 0; i < 10; i++) { 
                    var entity = new TestEntity { Data = Guid.NewGuid().ToString() };
                    _context.TestEntities.Add(entity);
                    count++;
                }

                await _context.SaveChangesAsync();
            }

            var data = new
            {
                TotalInserts = count
            };

            Response.ContentType = "application/json";
            return Content(JsonSerializer.Serialize(data));
        }
    }
}
