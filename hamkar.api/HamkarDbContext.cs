namespace Hamkar.Api;

public class HamkarDbContext(DbContextOptions<HamkarDbContext> options) : IdentityDbContext<ApplicationUser>(options)
{

    public DbSet<Product> Products => Set<Product>();
    public DbSet<ProductAttribute> ProductAttributes => Set<ProductAttribute>();
    public DbSet<ProductAttributeValue> ProductAttributeValues => Set<ProductAttributeValue>();
    public DbSet<Offer> Offers => Set<Offer>();
    public DbSet<OfferAttributeDefinition> OfferAttributeDefinitions => Set<OfferAttributeDefinition>();
    public DbSet<OfferAttributeValue> OfferAttributeValues => Set<OfferAttributeValue>();
    public DbSet<OfferAttributeSelection> OfferAttributeSelections => Set<OfferAttributeSelection>();
    public DbSet<OfferProductAttribute> OfferProductAttributes => Set<OfferProductAttribute>();
    public DbSet<AccessGrant> AccessGrants => Set<AccessGrant>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<OfferAttributeDefinition>()
            .ToTable("OfferAttributeDefinitions");

        modelBuilder.Entity<OfferAttributeValue>()
            .ToTable("OfferAttributeValues");

        modelBuilder.Entity<OfferAttributeSelection>()
            .ToTable("OfferAttributeSelections");

        modelBuilder.Entity<OfferProductAttribute>()
            .ToTable("OfferProductAttributes");

        modelBuilder.Entity<AccessGrant>()
            .HasOne(x => x.OwnerUser)
            .WithMany()
            .HasForeignKey(x => x.OwnerUserId)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<AccessGrant>()
            .HasOne(x => x.GrantedToUser)
            .WithMany()
            .HasForeignKey(x => x.GrantedToUserId)
            .OnDelete(DeleteBehavior.NoAction);


        // OfferAttributeDefinition -> OfferAttributeValue

        modelBuilder.Entity<OfferAttributeValue>()
            .HasOne(x => x.Definition)
            .WithMany(x => x.Values)
            .HasForeignKey(x => x.OfferAttributeDefinitionId)
            .OnDelete(DeleteBehavior.Cascade);


        // OfferAttributeSelection

        modelBuilder.Entity<OfferAttributeSelection>()
            .HasKey(x => new
            {
                x.OfferId,
                x.OfferAttributeDefinitionId,
                x.OfferAttributeValueId
            });

        modelBuilder.Entity<OfferAttributeSelection>()
            .HasOne(x => x.Offer)
            .WithMany(x => x.AttributeSelections)
            .HasForeignKey(x => x.OfferId);
        
        modelBuilder.Entity<OfferAttributeSelection>()
            .HasOne(x => x.Value)
            .WithMany()
            .HasForeignKey(x => x.OfferAttributeValueId)
            .OnDelete(DeleteBehavior.Restrict);


        // OfferProductAttribute

        modelBuilder.Entity<OfferProductAttribute>()
            .HasKey(x => new
            {
                x.OfferId,
                x.ProductAttributeId,
                x.ProductAttributeValueId
            });

        modelBuilder.Entity<OfferProductAttribute>()
            .HasOne(x => x.Offer)
            .WithMany(x => x.ProductAttributeSelections)
            .HasForeignKey(x => x.OfferId);

        modelBuilder.Entity<OfferProductAttribute>()
            .HasOne(x => x.ProductAttribute)
            .WithMany()
            .HasForeignKey(x => x.ProductAttributeId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<OfferProductAttribute>()
            .HasOne(x => x.ProductAttributeValue)
            .WithMany()
            .HasForeignKey(x => x.ProductAttributeValueId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<OfferAttributeDefinition>().HasData(
            new OfferAttributeDefinition
            {
                Id = 1,
                NameEn = "Warranty",
                NameFa = "گارانتی",
                Type = "select"
            },
            new OfferAttributeDefinition
            {
                Id = 2,
                NameEn = "Package",
                NameFa = "بسته‌بندی",
                Type = "select"
            }
        );

        modelBuilder.Entity<OfferAttributeValue>().HasData(
            new OfferAttributeValue
            {
                Id = 1,
                OfferAttributeDefinitionId = 1,
                ValueEn = "No Warranty",
                ValueFa = "بدون گارانتی"
            },
            new OfferAttributeValue
            {
                Id = 2,
                OfferAttributeDefinitionId = 1,
                ValueEn = "12 Months",
                ValueFa = "۱۲ ماه"
            },
            new OfferAttributeValue
            {
                Id = 3,
                OfferAttributeDefinitionId = 1,
                ValueEn = "18 Months",
                ValueFa = "۱۸ ماه"
            },

            new OfferAttributeValue
            {
                Id = 4,
                OfferAttributeDefinitionId = 2,
                ValueEn = "Complete",
                ValueFa = "کامل"
            },
            new OfferAttributeValue
            {
                Id = 5,
                OfferAttributeDefinitionId = 2,
                ValueEn = "Box Only",
                ValueFa = "فقط جعبه"
            },
            new OfferAttributeValue
            {
                Id = 6,
                OfferAttributeDefinitionId = 2,
                ValueEn = "Device Only",
                ValueFa = "فقط دستگاه"
            }
        );
    }
}