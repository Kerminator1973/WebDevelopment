using Microsoft.EntityFrameworkCore;
using sqlInsertBenchmark.Model;

namespace sqlInsertBenchmark
{
    public class BenchmarkDBContext : DbContext
    {
        public BenchmarkDBContext(DbContextOptions<BenchmarkDBContext> options) : base(options) { }
        public DbSet<TestEntity> TestEntities { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<TestEntity>()
                .HasIndex(e => e.Data);
        }
    }
}
