using Microsoft.EntityFrameworkCore;
using BandMananger.Models;

namespace BandMananger.Infrastructure.Data
{
    public class AppDbContext: DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) 
            : base(options)
        {
        }
        public DbSet<Member> Members { get; set; }

        public DbSet<Song> Songs { get; set; }

        public DbSet<Event> Events { get; set; }

        public DbSet<EventRecurrence> EventRecurrences { get; set; }

        public DbSet<Repertoire> Repertoires { get; set; }

        public DbSet<Presence> Presence { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Repertoire>()
                .HasOne(r => r.Event)
                .WithMany(e => e.Repertoires)
                .HasForeignKey(r => r.EventId);

            modelBuilder.Entity<Repertoire>()
                .HasOne(r => r.Song)
                .WithMany()
                .HasForeignKey(r => r.SongId);

            modelBuilder.Entity<Presence>()
                .HasOne(a => a.Event)
                .WithMany(e => e.Presences)
                .HasForeignKey(a => a.EventId);

            modelBuilder.Entity<Presence>()
                .HasOne(a => a.Member)
                .WithMany()
                .HasForeignKey(a => a.MemberId);

            modelBuilder.Entity<Event>()
                .HasOne(e => e.Recurrence)
                .WithMany(r => r.Events)
                .HasForeignKey(e => e.RecurrenceId)
                .OnDelete(DeleteBehavior.SetNull);
        }
    }
}
