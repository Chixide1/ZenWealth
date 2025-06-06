﻿using Microsoft.AspNetCore.Identity;

namespace ZenWealth.Core.Domain.Entities;

public class User : IdentityUser
{
    public List<Item> Items { get; } = [];
    
    public List<Account> Accounts { get; } = [];
    
    public List<Transaction> Transactions { get; } = [];
    
    public List<Budget> Budgets { get; } = [];
}